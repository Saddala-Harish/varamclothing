CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

CREATE TABLE public.store_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name text NOT NULL DEFAULT 'Varam Vastra & Jewels',
  tagline text NOT NULL DEFAULT 'Handcrafted Sarees, Ethnic Wear & 1-Gram Gold Jewels',
  phone text NOT NULL DEFAULT '+91 98765 43210',
  whatsapp text NOT NULL DEFAULT '919876543210',
  email text NOT NULL DEFAULT 'hello@varamvastra.in',
  address text NOT NULL DEFAULT 'Varam Atelier, T. Nagar, Chennai, Tamil Nadu 600017',
  business_hours text NOT NULL DEFAULT 'Mon – Sat: 10:00 AM – 8:00 PM · Sunday: 11:00 AM – 5:00 PM',
  delivery_charge numeric NOT NULL DEFAULT 99,
  free_delivery_threshold numeric NOT NULL DEFAULT 1999,
  cod_enabled boolean NOT NULL DEFAULT true,
  upi_enabled boolean NOT NULL DEFAULT true,
  upi_id text NOT NULL DEFAULT 'varamvastra@upi',
  shipping_policy text NOT NULL DEFAULT 'Orders are dispatched within 2–3 working days. Pan-India delivery usually takes 4–7 business days.',
  return_policy text NOT NULL DEFAULT '7-day exchange on unused products with original tags. Jewellery is non-returnable for hygiene reasons unless damaged in transit.',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads settings" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update settings" ON public.store_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.store_settings (id) VALUES (1);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL CHECK (price >= 0),
  mrp numeric,
  images text[] NOT NULL DEFAULT '{}',
  sizes text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  stock int NOT NULL DEFAULT 0 CHECK (stock >= 0),
  featured boolean NOT NULL DEFAULT false,
  new_arrival boolean NOT NULL DEFAULT false,
  best_seller boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active products" ON public.products FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  address_line text NOT NULL,
  landmark text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'unpaid',
  status text NOT NULL DEFAULT 'pending',
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  delivery_charge numeric NOT NULL,
  total numeric NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.products (slug,name,category,description,price,mrp,images,sizes,colors,stock,featured,new_arrival,best_seller) VALUES
('maharani-crimson-kanjivaram-silk-saree','Maharani Crimson Kanjivaram Silk Saree','sarees','Pure Kanjivaram silk woven by master artisans in Kanchipuram with a rich pure zari border and temple motifs. Comes with an unstitched 0.8m blouse piece.',5499,7200,ARRAY['stitch:43','stitch:20','stitch:23','stitch:24','stitch:25','stitch:26']::text[],ARRAY[]::text[],ARRAY['Crimson Maroon','Peacock Blue','Mustard Gold']::text[],3,true,false,true),
('crimson-bridal-kanjivaram-saree','Crimson Bridal Kanjivaram Saree','sarees','Bridal Kanjivaram silk with golden zari peacock butta and a contrast pallu. Perfect for weddings and festive occasions.',4850,6200,ARRAY['stitch:15','stitch:22']::text[],ARRAY[]::text[],ARRAY['Crimson Red','Wine']::text[],8,true,true,false),
('midnight-navy-banarasi-katan-saree','Midnight Navy Banarasi Katan Silk Saree','sarees','Handwoven Banarasi Katan silk in royal midnight navy with antique gold zari jaal work.',6299,7999,ARRAY['stitch:41']::text[],ARRAY[]::text[],ARRAY['Midnight Navy']::text[],5,false,true,true),
('classic-red-pattu-saree','Classic Red Pattu Silk Saree','sarees','A timeless red pattu silk saree with intricate gold zari detailing for poojas and celebrations.',3999,4800,ARRAY['stitch:35','stitch:7']::text[],ARRAY[]::text[],ARRAY['Red','Maroon']::text[],12,true,false,true),
('royal-antique-matte-temple-choker','Royal Antique Matte Temple Choker Set','gold-jewellery','1-gram micro gold plated temple choker with matching jhumkas, set with ruby and emerald stones.',2199,2899,ARRAY['stitch:16','stitch:8']::text[],ARRAY[]::text[],ARRAY['Antique Gold']::text[],10,true,true,false),
('lakshmi-temple-choker-necklace','Lakshmi Temple Choker Necklace','gold-jewellery','Goddess Lakshmi motif choker in micro matte 1-gram gold with ruby accents and pearl drops.',2499,3200,ARRAY['stitch:21','stitch:44','stitch:28']::text[],ARRAY[]::text[],ARRAY['Matte Gold']::text[],7,false,false,true),
('long-bridal-haram-necklace','Long Bridal Haram Necklace','gold-jewellery','Elaborate long haram with engraved detailing, ideal for bridal and festive wear. 1-gram gold plated.',3299,4100,ARRAY['stitch:40','stitch:11']::text[],ARRAY[]::text[],ARRAY['Antique Gold']::text[],4,true,false,false),
('temple-jada-billai-hair-accessory','Temple Jada Billai Hair Accessory','gold-jewellery','Traditional South Indian micro gold plated jada billai for bridal hairdos.',1499,1899,ARRAY['stitch:46']::text[],ARRAY[]::text[],ARRAY['Gold']::text[],15,false,true,false),
('antique-oddiyanam-waist-belt','Antique Oddiyanam Waist Belt','gold-jewellery','Adjustable antique matte gold plated oddiyanam (waist belt) with temple motifs.',1899,2400,ARRAY['stitch:48','stitch:36']::text[],ARRAY['Adjustable']::text[],ARRAY['Antique Gold']::text[],6,false,false,false),
('emerald-meenakari-bangle-stack','Emerald Meenakari Bangle Stack','bangles','Stack of 24 emerald green meenakari bangles adorned with gold accents.',1250,1450,ARRAY['stitch:18']::text[],ARRAY['2.4','2.6','2.8']::text[],ARRAY['Emerald Green']::text[],20,true,true,false),
('kundan-bridal-bangle-stack','Kundan Bridal Bangle Stack','bangles','Rich kundan studded bridal bangle stack in brass with gold finish.',1799,2199,ARRAY['stitch:13']::text[],ARRAY['2.4','2.6','2.8']::text[],ARRAY['Gold','Red']::text[],9,false,false,true),
('gold-plated-floral-filigree-bangles','Gold Plated Floral Filigree Bangles (Set of 4)','bangles','Set of four gold plated bangles with delicate floral filigree work.',999,1299,ARRAY['stitch:29']::text[],ARRAY['2.4','2.6','2.8']::text[],ARRAY['Gold']::text[],25,false,true,false),
('velvet-maroon-bridal-bangles','Velvet Maroon Bridal Bangles','bangles','24 velvet maroon bridal bangles interlocked with glistening stone kadas.',1399,1699,ARRAY['stitch:38']::text[],ARRAY['2.4','2.6']::text[],ARRAY['Maroon']::text[],0,false,false,false),
('firozabad-glass-bangles-set','Firozabad Glass Bangles (Set of 48)','bangles','Traditional handmade Firozabad glass bangles in festive colours.',599,799,ARRAY['stitch:42','stitch:45']::text[],ARRAY['2.2','2.4','2.6','2.8']::text[],ARRAY['Crimson','Multicolour']::text[],30,false,false,true),
('pastel-pink-pattu-pavadai','Pastel Pink Handloom Pattu Pavadai','girls-dresses','Pastel pink and mint handloom silk Pattu Pavadai for young girls with zari border.',1850,2450,ARRAY['stitch:17']::text[],ARRAY['2-3Y','4-5Y','6-7Y','8-9Y']::text[],ARRAY['Pink & Mint']::text[],10,true,true,false),
('royal-pattu-pavadai-lehenga','Royal Pattu Pavadai Lehenga Set','girls-dresses','Traditional South Indian girls'' pattu pavadai lehenga in royal colours.',2250,2800,ARRAY['stitch:37','stitch:14']::text[],ARRAY['2-3Y','4-5Y','6-7Y','8-9Y','10-11Y']::text[],ARRAY['Royal Blue','Magenta']::text[],8,false,false,true),
('emerald-handblock-anarkali','Emerald Handblock Anarkali','womens-clothing','Deep emerald and maroon handblock printed anarkali with dupatta.',2799,3499,ARRAY['stitch:12']::text[],ARRAY['S','M','L','XL','XXL']::text[],ARRAY['Emerald']::text[],11,true,true,false),
('mint-chanderi-kurta-set','Mint Chanderi Silk Kurta Set','womens-clothing','Graceful mint green Chanderi silk straight kurta set with delicate embroidery.',1999,2499,ARRAY['stitch:39']::text[],ARRAY['S','M','L','XL','XXL']::text[],ARRAY['Mint Green']::text[],14,false,false,true);

CREATE OR REPLACE FUNCTION public.place_order(_customer jsonb, _items jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s public.store_settings;
  it jsonb;
  p public.products;
  qty int;
  line_items jsonb := '[]'::jsonb;
  sub numeric := 0;
  del numeric := 0;
  ref text;
  new_id uuid;
  pay text := _customer->>'payment_method';
BEGIN
  SELECT * INTO s FROM public.store_settings WHERE id = 1;
  IF coalesce(trim(_customer->>'customer_name'),'') = '' THEN RAISE EXCEPTION 'Name is required'; END IF;
  IF coalesce(_customer->>'phone','') !~ '^[6-9][0-9]{9}$' THEN RAISE EXCEPTION 'Enter a valid 10-digit mobile number'; END IF;
  IF coalesce(trim(_customer->>'address_line'),'') = '' OR coalesce(trim(_customer->>'city'),'') = '' OR coalesce(trim(_customer->>'state'),'') = '' THEN RAISE EXCEPTION 'Full address is required'; END IF;
  IF coalesce(_customer->>'pincode','') !~ '^[1-9][0-9]{5}$' THEN RAISE EXCEPTION 'Enter a valid 6-digit PIN code'; END IF;
  IF pay IS NULL OR pay NOT IN ('cod','upi') THEN RAISE EXCEPTION 'Choose a payment method'; END IF;
  IF pay = 'cod' AND NOT s.cod_enabled THEN RAISE EXCEPTION 'Cash on Delivery is not available'; END IF;
  IF pay = 'upi' AND NOT s.upi_enabled THEN RAISE EXCEPTION 'UPI is not available'; END IF;
  IF jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN RAISE EXCEPTION 'Your cart is empty'; END IF;

  FOR it IN SELECT * FROM jsonb_array_elements(_items) LOOP
    qty := (it->>'quantity')::int;
    IF qty IS NULL OR qty < 1 OR qty > 20 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
    SELECT * INTO p FROM public.products WHERE id = (it->>'product_id')::uuid AND active FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'A product in your cart is no longer available'; END IF;
    IF p.stock < qty THEN RAISE EXCEPTION 'Only % left of %', p.stock, p.name; END IF;
    UPDATE public.products SET stock = stock - qty WHERE id = p.id;
    sub := sub + p.price * qty;
    line_items := line_items || jsonb_build_object('product_id', p.id, 'slug', p.slug, 'name', p.name, 'image', p.images[1],
      'price', p.price, 'quantity', qty, 'size', it->>'size', 'color', it->>'color');
  END LOOP;

  IF sub < s.free_delivery_threshold THEN del := s.delivery_charge; END IF;
  ref := 'VV-' || to_char(now() AT TIME ZONE 'Asia/Kolkata','YYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text),1,5));

  INSERT INTO public.orders (order_ref, customer_name, phone, email, address_line, landmark, city, state, pincode,
    payment_method, items, subtotal, delivery_charge, total, notes)
  VALUES (ref, trim(_customer->>'customer_name'), _customer->>'phone', nullif(_customer->>'email',''), trim(_customer->>'address_line'),
    nullif(_customer->>'landmark',''), trim(_customer->>'city'), _customer->>'state', _customer->>'pincode',
    pay, line_items, sub, del, sub + del, nullif(_customer->>'notes',''))
  RETURNING id INTO new_id;
  RETURN jsonb_build_object('id', new_id, 'order_ref', ref);
END $$;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_order(_id uuid)
RETURNS SETOF public.orders LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.orders WHERE id = _id
$$;
GRANT EXECUTE ON FUNCTION public.get_order(uuid) TO anon, authenticated;