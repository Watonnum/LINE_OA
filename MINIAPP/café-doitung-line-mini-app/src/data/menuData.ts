import { Branch, MenuItem } from '../types';

export const BRANCHES: Branch[] = [
  {
    id: 'doitung-flagship',
    name: 'DoiTung Flagship Store',
    thName: 'สาขาดอยตุง โครงการพัฒนาดอยตุง',
    location: 'Doi Tung Development Project, Mae Fah Luang, Chiang Rai',
    hours: '07:30 - 18:00',
    distance: '0.2 km',
    avgWaitMins: 10,
    phone: '053-767-015'
  },
  {
    id: 'central-world',
    name: 'Central World Branch',
    thName: 'สาขาเซ็นทรัลเวิลด์ ชั้น 2',
    location: 'Floor 2 (Beacon Zone), CentralWorld, Bangkok',
    hours: '09:00 - 21:00',
    distance: '1.5 km',
    avgWaitMins: 15,
    phone: '02-646-1234'
  },
  {
    id: 'chiang-rai-airport',
    name: 'Mae Fah Luang Airport',
    thName: 'สาขาท่าอากาศยานแม่ฟ้าหลวง',
    location: 'Departures Level, Chiang Rai Airport',
    hours: '06:00 - 20:00',
    distance: '12 km',
    avgWaitMins: 8,
    phone: '053-771-122'
  },
  {
    id: 'silom-complex',
    name: 'Silom Complex Branch',
    thName: 'สาขาสีลมคอมเพล็กซ์',
    location: 'Floor G, Silom Complex, Bangkok',
    hours: '07:00 - 19:30',
    distance: '3.8 km',
    avgWaitMins: 12,
    phone: '02-231-3311'
  }
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dt-drip-coffee',
    name: 'DoiTung Signature Drip Coffee',
    thName: 'กาแฟดริปดอยตุง ซิกเนเจอร์',
    category: 'coffee',
    price: 110,
    description: 'Hand-poured single origin 100% Arabica grown 1,200m above sea level in Chiang Rai. Rich chocolate & roasted macadamia aroma.',
    thDescription: 'กาแฟดริปอาราบิก้าแท้ 100% จากดอยตุง กลิ่นหอมถั่วแมคคาเดเมียและช็อกโกแลตเข้มข้น',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    badge: 'Signature',
    isPopular: true,
    isEcoRecommended: true,
    allowTemp: ['Hot', 'Iced'],
    allowMilk: false,
    allowSweetness: true
  },
  {
    id: 'dt-macadamia-latte',
    name: 'Iced Macadamia Latte',
    thName: 'ไอซ์ แมคคาเดเมีย ลาเต้',
    category: 'coffee',
    price: 130,
    description: 'Smooth espresso with fresh steam milk and natural macadamia syrup harvested directly from DoiTung sustainable orchards.',
    thDescription: 'ลาเต้เข้มข้นหอมมัน ผสมไซรัปแมคคาเดเมียแท้จากสวนดอยตุง',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    badge: 'Best Seller',
    isPopular: true,
    isEcoRecommended: true,
    allowTemp: ['Hot', 'Iced', 'Frappe'],
    allowMilk: true,
    allowSweetness: true
  },
  {
    id: 'dt-cold-brew',
    name: 'Cold Brew Arabica',
    thName: 'โคลด์บรูว์ อาราบิก้า',
    category: 'coffee',
    price: 120,
    description: 'Slow-steeped for 16 hours. Ultra smooth body with subtle citrus notes and clean caramel finish.',
    thDescription: 'สกัดเย็นนาน 16 ชั่วโมง นุ่มลึก ไม่เปรี้ยวโดด พร้อมกลิ่นส้มเบาๆ',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    badge: 'Refresh',
    isPopular: true,
    isEcoRecommended: true,
    allowTemp: ['Iced'],
    allowMilk: true,
    allowSweetness: true
  },
  {
    id: 'dt-americano',
    name: 'Hot Americano',
    thName: 'อเมริกาโน่ร้อน',
    category: 'coffee',
    price: 85,
    description: 'Double shot dark roast Arabica espresso diluted with hot mountain spring water.',
    thDescription: 'เอสเปรสโซเข้มข้นช็อตคู่ ผสมน้ำร้อนอุณหภูมิพอเหมาะ',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    allowTemp: ['Hot', 'Iced'],
    allowMilk: false,
    allowSweetness: true
  },
  {
    id: 'dt-matcha-latte',
    name: 'DoiTung Organic Matcha',
    thName: 'มัทฉะลาเต้ออร์แกนิค',
    category: 'non-coffee',
    price: 125,
    description: 'Ceremonial grade organic Japanese matcha whisked with fresh milk and subtle honey blossom sweetness.',
    thDescription: 'ชาเขียวมัทฉะเกรดพรีเมียม หอมเข้มข้นกลมกล่อม',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    badge: 'Organic',
    isPopular: true,
    allowTemp: ['Hot', 'Iced', 'Frappe'],
    allowMilk: true,
    allowSweetness: true
  },
  {
    id: 'dt-thai-tea',
    name: 'Thai Tea Cream Latte',
    thName: 'ชาไทยครีมลาเต้',
    category: 'non-coffee',
    price: 95,
    description: 'Northern Thai black tea leaves slowly steeped, layered with creamy velvety milk.',
    thDescription: 'ชาไทยพรีเมียมหอมตราดอยตุง รสชาติเข้มข้น หอมมันกำลังดี',
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=800&q=80',
    allowTemp: ['Hot', 'Iced', 'Frappe'],
    allowMilk: true,
    allowSweetness: true
  },
  {
    id: 'dt-macadamia-croissant',
    name: 'DoiTung Macadamia Croissant',
    thName: 'ครัวซองต์แมคคาเดเมีย',
    category: 'bakery',
    price: 95,
    description: 'Flaky, golden French butter croissant topped with generous roasted Chiang Rai macadamia nuts & maple glaze.',
    thDescription: 'ครัวซองต์เนยสดฝรั่งเศส โรยแมคคาเดเมียอบกรอบราดคาราเมล',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    badge: 'Chef Favorite',
    isPopular: true
  },
  {
    id: 'dt-macadamia-tart',
    name: 'Roasted Macadamia Tart',
    thName: 'ทาร์ตแมคคาเดเมีย',
    category: 'bakery',
    price: 110,
    description: 'Crisp pastry shell filled with honey-caramelized roasted macadamias from the Mae Fah Luang Foundation.',
    thDescription: 'ทาร์ตกรอบเต็มคำ อัดแน่นด้วยแมคคาเดเมียเคลือบคาราเมลน้ำผึ้ง',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'dt-whole-beans',
    name: 'Single Origin Whole Beans (250g)',
    thName: 'เมล็ดกาแฟดอยตุง คั่วกลาง (250 กรัม)',
    category: 'packaged',
    price: 320,
    description: 'Medium roast whole beans. Tasting notes: Roasted Hazelnut, Milk Chocolate, Dried Apricot.',
    thDescription: 'เมล็ดกาแฟคั่วกลางอาราบิก้า 100% โน้ตเฮเซลนัท ช็อกโกแลต และแอปริคอต',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
    badge: 'DoiTung Beans'
  },
  {
    id: 'dt-drip-bag-box',
    name: 'DoiTung Drip Coffee Bag (Box of 6)',
    thName: 'กาแฟดริปแบบซองดอยตุง (กล่อง 6 ซอง)',
    category: 'packaged',
    price: 180,
    description: 'Convenient single-use drip filter bags packed with fresh ground specialty Arabica.',
    thDescription: 'กาแฟดริปแบบซอง พกพาสะดวก ชงง่ายเพียงเติมน้ำร้อน',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80'
  }
];

export const PICKUP_TIMES = [
  { id: 'asap', label: 'ASAP (10-15 mins)', value: 'ASAP (10-15 mins)' },
  { id: 'in_30', label: 'In 30 mins', value: 'In 30 mins' },
  { id: 'in_60', label: 'In 1 hour', value: 'In 1 hour' },
  { id: 'custom', label: 'Custom Time', value: 'Custom Time' }
];
