-- Seed products with developer merchandise from major tech companies

-- Amazon merchandise
insert into public.products (name, description, price, category, brand, image_url, stock) values
('Amazon Logo Hoodie', 'Premium black hoodie with Amazon logo', 4500.00, 'hoodies', 'Amazon', '/placeholder.svg?height=400&width=400', 50),
('Amazon Laptop Stickers Pack', 'Set of 10 Amazon-themed vinyl stickers', 800.00, 'stickers', 'Amazon', '/placeholder.svg?height=400&width=400', 200),
('Amazon Sweatshirt', 'Comfortable Amazon branded sweatshirt', 3800.00, 'sweatshirts', 'Amazon', '/placeholder.svg?height=400&width=400', 75),
('Amazon Headband', 'Sports headband with Amazon branding', 600.00, 'headbands', 'Amazon', '/placeholder.svg?height=400&width=400', 100);

-- AWS merchandise
insert into public.products (name, description, price, category, brand, image_url, stock) values
('AWS Cloud Hoodie', 'Black hoodie with AWS cloud logo', 4800.00, 'hoodies', 'AWS', '/placeholder.svg?height=400&width=400', 60),
('AWS Sticker Collection', 'Premium AWS service stickers (Lambda, S3, EC2)', 900.00, 'stickers', 'AWS', '/placeholder.svg?height=400&width=400', 150),
('AWS Sweatshirt', 'Orange accent AWS sweatshirt', 4000.00, 'sweatshirts', 'AWS', '/placeholder.svg?height=400&width=400', 80),
('AWS Headband', 'Performance headband with AWS logo', 650.00, 'headbands', 'AWS', '/placeholder.svg?height=400&width=400', 90);

-- Vercel merchandise
insert into public.products (name, description, price, category, brand, image_url, stock) values
('Vercel Triangle Hoodie', 'Sleek black hoodie with Vercel triangle', 5000.00, 'hoodies', 'Vercel', '/placeholder.svg?height=400&width=400', 45),
('Vercel Sticker Pack', 'Holographic Vercel logo stickers', 850.00, 'stickers', 'Vercel', '/placeholder.svg?height=400&width=400', 180),
('Vercel Sweatshirt', 'Premium Vercel branded sweatshirt', 4200.00, 'sweatshirts', 'Vercel', '/placeholder.svg?height=400&width=400', 70),
('Vercel Headband', 'Minimalist Vercel headband', 700.00, 'headbands', 'Vercel', '/placeholder.svg?height=400&width=400', 85);

-- Anthropic merchandise
insert into public.products (name, description, price, category, brand, image_url, stock) values
('Anthropic Claude Hoodie', 'Black hoodie with Claude AI branding', 4900.00, 'hoodies', 'Anthropic', '/placeholder.svg?height=400&width=400', 55),
('Anthropic Sticker Set', 'AI-themed Anthropic stickers', 800.00, 'stickers', 'Anthropic', '/placeholder.svg?height=400&width=400', 170),
('Anthropic Sweatshirt', 'Comfortable Anthropic branded sweatshirt', 3900.00, 'sweatshirts', 'Anthropic', '/placeholder.svg?height=400&width=400', 65),
('Anthropic Headband', 'Tech headband with Anthropic logo', 650.00, 'headbands', 'Anthropic', '/placeholder.svg?height=400&width=400', 95);

-- Google merchandise
insert into public.products (name, description, price, category, brand, image_url, stock) values
('Google Logo Hoodie', 'Colorful Google logo hoodie', 4600.00, 'hoodies', 'Google', '/placeholder.svg?height=400&width=400', 70),
('Google Sticker Pack', 'Classic Google product stickers', 750.00, 'stickers', 'Google', '/placeholder.svg?height=400&width=400', 220),
('Google Sweatshirt', 'Google branded crew neck sweatshirt', 3700.00, 'sweatshirts', 'Google', '/placeholder.svg?height=400&width=400', 90),
('Google Headband', 'Sporty Google headband', 600.00, 'headbands', 'Google', '/placeholder.svg?height=400&width=400', 110);

-- Microsoft merchandise
insert into public.products (name, description, price, category, brand, image_url, stock) values
('Microsoft Azure Hoodie', 'Azure blue accent hoodie', 4700.00, 'hoodies', 'Microsoft', '/placeholder.svg?height=400&width=400', 65),
('Microsoft Sticker Collection', 'Windows, Azure, VS Code stickers', 850.00, 'stickers', 'Microsoft', '/placeholder.svg?height=400&width=400', 190),
('Microsoft Sweatshirt', 'Classic Microsoft logo sweatshirt', 3800.00, 'sweatshirts', 'Microsoft', '/placeholder.svg?height=400&width=400', 85),
('Microsoft Headband', 'Performance headband with MS logo', 620.00, 'headbands', 'Microsoft', '/placeholder.svg?height=400&width=400', 100);
