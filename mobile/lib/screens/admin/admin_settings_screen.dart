import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile/services/api_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AdminSettingsScreen extends StatefulWidget {
  const AdminSettingsScreen({super.key});

  @override
  State<AdminSettingsScreen> createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends State<AdminSettingsScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;

  // General Settings
  final _siteNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _currencyController = TextEditingController();
  final _taxRateController = TextEditingController();

  // Payment & Shipping
  List<String> _paymentMethods = [];
  List<String> _shippingMethods = [];

  // Pickup Mtaani Data
  List<Map<String, dynamic>> _areas = [];
  List<Map<String, dynamic>> _locations = [];

  // Selected Values
  String? _selectedAreaId;
  String? _selectedLocationId;
  String? _selectedAgentId;
  bool _isLoadingLocations = false;
  bool _isLoadingAgents = false;
  List<Map<String, dynamic>> _agents = [];

  // Saving States
  bool _isSavingGeneral = false;
  bool _isSavingPickup = false;
  bool _isSavingPayment = false;
  bool _isSavingShipping = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      // Load areas and settings
      final results = await Future.wait([
        _apiService.getPickupAreas(),
        _getSettings(),
      ]);

      final areas = results[0] as List<Map<String, dynamic>>;
      final settings = results[1] as Map<String, dynamic>;

      String? initialAreaId;
      String? initialLocationId;
      String? initialAgentId;

      if (settings['pickup_mtaani_origin'] != null) {
        var origin = settings['pickup_mtaani_origin'];
        if (origin is String) {
          try {
            origin = json.decode(origin);
          } catch (e) {
            debugPrint('Error parsing origin JSON: $e');
          }
        }

        if (origin is Map) {
          initialAreaId = origin['area_id']?.toString() ??
              origin['area']?.toString(); // Handle legacy
          initialLocationId = origin['location_id']?.toString();
          initialAgentId = origin['agent_id']?.toString();
        }
      }

      // Load locations and agents if available (sequentially, outside setState)
      if (initialAreaId != null) {
        await _loadLocationsByArea(initialAreaId);
        if (initialLocationId != null) {
          await _loadAgents(initialLocationId);
        }
      }

      if (mounted) {
        setState(() {
          _areas = areas;

          // Populate General Settings
          _siteNameController.text = settings['site_name'] ?? '';
          _emailController.text = settings['site_email'] ?? '';
          _phoneController.text = settings['phone'] ?? '';
          _currencyController.text = settings['currency'] ?? 'KES';
          _taxRateController.text = settings['tax_rate']?.toString() ?? '0';

          // Populate Arrays
          _paymentMethods =
              List<String>.from(settings['payment_methods'] ?? []);
          _shippingMethods =
              List<String>.from(settings['shipping_methods'] ?? []);

          // Set Selected Values
          _selectedAreaId = initialAreaId;
          _selectedLocationId = initialLocationId;
          _selectedAgentId = initialAgentId;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading settings: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<Map<String, dynamic>> _getSettings() async {
    final response = await Supabase.instance.client
        .from('app_settings')
        .select('key, value');

    final Map<String, dynamic> settings = {};
    for (var item in response) {
      settings[item['key']] = item['value'];
    }
    return settings;
  }

  Future<void> _updateSetting(String key, dynamic value) async {
    await Supabase.instance.client.from('app_settings').upsert({
      'key': key,
      'value': value,
      'updated_at': DateTime.now().toIso8601String(),
    }, onConflict: 'key');
  }

  Future<void> _loadLocationsByArea(String areaId) async {
    setState(() => _isLoadingLocations = true);
    try {
      final locations = await _apiService.getPickupLocations(areaId: areaId);
      if (mounted) {
        setState(() {
          _locations = locations;
          _isLoadingLocations = false;
          // Clear subsequent selections if they are not valid anymore
          if (_selectedLocationId != null &&
              !locations
                  .any((l) => l['id'].toString() == _selectedLocationId)) {
            _selectedLocationId = null;
            _selectedAgentId = null;
            _agents = [];
          }
        });
      }
    } catch (e) {
      debugPrint('Error loading locations: $e');
      if (mounted) {
        setState(() => _isLoadingLocations = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load locations')),
        );
      }
    }
  }

  Future<void> _loadAgents(String locationId) async {
    setState(() => _isLoadingAgents = true);
    try {
      final agents = await _apiService.getPickupAgents(locationId);
      if (mounted) {
        setState(() {
          _agents = agents;
          _isLoadingAgents = false;
          // Clear selected agent if not in list
          if (_selectedAgentId != null &&
              !agents.any((a) => a['id'].toString() == _selectedAgentId)) {
            _selectedAgentId = null;
          }
        });
      }
    } catch (e) {
      debugPrint('Error loading agents: $e');
      if (mounted) {
        setState(() => _isLoadingAgents = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load agents')),
        );
      }
    }
  }

  Future<void> _saveGeneralSettings() async {
    setState(() => _isSavingGeneral = true);
    try {
      await _updateSetting('site_name', _siteNameController.text);
      await _updateSetting('site_email', _emailController.text);
      await _updateSetting('phone', _phoneController.text);
      await _updateSetting('currency', _currencyController.text);
      await _updateSetting('tax_rate', _taxRateController.text);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('General settings saved')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving general settings: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSavingGeneral = false);
    }
  }

  Future<void> _savePickupSettings() async {
    if (_selectedAgentId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an agent')),
      );
      return;
    }

    setState(() => _isSavingPickup = true);
    try {
      final location = _locations.firstWhere(
        (l) => l['id'].toString() == _selectedLocationId,
        orElse: () => {'name': '', 'town': ''},
      );

      final agent = _agents.firstWhere(
        (a) => a['id'].toString() == _selectedAgentId,
        orElse: () => {'business_name': ''},
      );

      final value = {
        'area_id': _selectedAreaId,
        'location_id': _selectedLocationId,
        'agent_id': _selectedAgentId,
        'agent_name': agent['business_name'],
        'location_name': location['name'],
        'area': _selectedAreaId, // Legacy support
      };

      await _updateSetting('pickup_mtaani_origin', value);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pickup settings saved')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving pickup settings: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSavingPickup = false);
    }
  }

  Future<void> _savePaymentSettings() async {
    setState(() => _isSavingPayment = true);
    try {
      await _updateSetting('payment_methods', _paymentMethods);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment methods saved')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving payment methods: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSavingPayment = false);
    }
  }

  Future<void> _saveShippingSettings() async {
    setState(() => _isSavingShipping = true);
    try {
      await _updateSetting('shipping_methods', _shippingMethods);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Shipping methods saved')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving shipping methods: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSavingShipping = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // General Settings
                  _buildSectionCard(
                    title: 'General Settings',
                    child: Column(
                      children: [
                        TextField(
                          controller: _siteNameController,
                          decoration:
                              const InputDecoration(labelText: 'Site Name'),
                        ),
                        TextField(
                          controller: _emailController,
                          decoration: const InputDecoration(labelText: 'Email'),
                        ),
                        TextField(
                          controller: _phoneController,
                          decoration: const InputDecoration(labelText: 'Phone'),
                        ),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _currencyController,
                                decoration: const InputDecoration(
                                    labelText: 'Currency'),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: TextField(
                                controller: _taxRateController,
                                decoration: const InputDecoration(
                                    labelText: 'Tax Rate (%)'),
                                keyboardType: TextInputType.number,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed:
                                _isSavingGeneral ? null : _saveGeneralSettings,
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  Theme.of(context).colorScheme.tertiary,
                              foregroundColor:
                                  Theme.of(context).colorScheme.onTertiary,
                            ),
                            child: _isSavingGeneral
                                ? SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onTertiary,
                                    ),
                                  )
                                : const Text('Save General Settings'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Pickup Mtaani
                  _buildSectionCard(
                    title: 'Pickup Mtaani Configuration',
                    child: Column(
                      children: [
                        const Text(
                          'Set the default drop-off point (Origin) for deliveries.',
                          style: TextStyle(color: Colors.grey),
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          value: _selectedAreaId,
                          decoration: const InputDecoration(
                            labelText: 'Area / Region',
                            border: OutlineInputBorder(),
                          ),
                          items: _areas.map((area) {
                            return DropdownMenuItem<String>(
                              value: area['id'].toString(),
                              child: Text(area['name'] ?? ''),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedAreaId = value;
                              _selectedLocationId = null;
                              _locations = [];
                            });
                            if (value != null) {
                              _loadLocationsByArea(value);
                            }
                          },
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          value: _selectedLocationId,
                          decoration: InputDecoration(
                            labelText: 'Pickup Location',
                            border: const OutlineInputBorder(),
                            suffixIcon: _isLoadingLocations
                                ? const Padding(
                                    padding: EdgeInsets.all(12.0),
                                    child: SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2),
                                    ),
                                  )
                                : null,
                          ),
                          items: _locations.map((loc) {
                            return DropdownMenuItem<String>(
                              value: loc['id'].toString(),
                              child: Text(
                                loc['name'] ?? '',
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged:
                              (_selectedAreaId == null || _locations.isEmpty)
                                  ? null
                                  : (value) {
                                      setState(() {
                                        _selectedLocationId = value;
                                        _selectedAgentId = null;
                                        _agents = [];
                                      });
                                      if (value != null) {
                                        _loadAgents(value);
                                      }
                                    },
                          hint: Text(_selectedAreaId == null
                              ? 'Select area first'
                              : _locations.isEmpty && !_isLoadingLocations
                                  ? 'No locations available'
                                  : 'Select Location'),
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          value: _selectedAgentId,
                          decoration: InputDecoration(
                            labelText: 'Pickup Agent',
                            border: const OutlineInputBorder(),
                            suffixIcon: _isLoadingAgents
                                ? const Padding(
                                    padding: EdgeInsets.all(12.0),
                                    child: SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2),
                                    ),
                                  )
                                : null,
                          ),
                          items: _agents.map((agent) {
                            return DropdownMenuItem<String>(
                              value: agent['id'].toString(),
                              child: Text(
                                agent['business_name'] ?? '',
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged:
                              (_selectedLocationId == null || _agents.isEmpty)
                                  ? null
                                  : (value) {
                                      setState(() {
                                        _selectedAgentId = value;
                                      });
                                    },
                          hint: Text(_selectedLocationId == null
                              ? 'Select location first'
                              : _agents.isEmpty && !_isLoadingAgents
                                  ? 'No agents available'
                                  : 'Select Agent'),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed:
                                _isSavingPickup ? null : _savePickupSettings,
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  Theme.of(context).colorScheme.tertiary,
                              foregroundColor:
                                  Theme.of(context).colorScheme.onTertiary,
                            ),
                            child: _isSavingPickup
                                ? SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onTertiary,
                                    ),
                                  )
                                : const Text('Save Pickup Settings'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Payment Methods
                  _buildSectionCard(
                    title: 'Payment Methods',
                    child: Column(
                      children: [
                        ...['mpesa', 'pod', 'bank_transfer'].map((method) {
                          return CheckboxListTile(
                            title:
                                Text(method.toUpperCase().replaceAll('_', ' ')),
                            value: _paymentMethods.contains(method),
                            onChanged: (bool? value) {
                              setState(() {
                                if (value == true) {
                                  _paymentMethods.add(method);
                                } else {
                                  _paymentMethods.remove(method);
                                }
                              });
                            },
                          );
                        }),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed:
                                _isSavingPayment ? null : _savePaymentSettings,
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  Theme.of(context).colorScheme.tertiary,
                              foregroundColor:
                                  Theme.of(context).colorScheme.onTertiary,
                            ),
                            child: _isSavingPayment
                                ? SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onTertiary,
                                    ),
                                  )
                                : const Text('Save Payment Methods'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Shipping Methods
                  _buildSectionCard(
                    title: 'Shipping Methods',
                    child: Column(
                      children: [
                        ...['home_delivery', 'pickup_mtaani'].map((method) {
                          return CheckboxListTile(
                            title:
                                Text(method.toUpperCase().replaceAll('_', ' ')),
                            value: _shippingMethods.contains(method),
                            onChanged: (bool? value) {
                              setState(() {
                                if (value == true) {
                                  _shippingMethods.add(method);
                                } else {
                                  _shippingMethods.remove(method);
                                }
                              });
                            },
                          );
                        }),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _isSavingShipping
                                ? null
                                : _saveShippingSettings,
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  Theme.of(context).colorScheme.tertiary,
                              foregroundColor:
                                  Theme.of(context).colorScheme.onTertiary,
                            ),
                            child: _isSavingShipping
                                ? SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onTertiary,
                                    ),
                                  )
                                : const Text('Save Shipping Methods'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionCard({required String title, required Widget child}) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            child,
          ],
        ),
      ),
    );
  }
}
