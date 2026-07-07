import { createSlice } from "@reduxjs/toolkit";

export interface MetricCard {
  label: string;
  value: string;
  growth: string;
  trend: "up" | "down";
}

export interface OrderRow {
  id: number;
  name: string;
  variants: string;
  category: string;
  price: string;
  image: string;
  status: "Delivered" | "Pending" | "Canceled";
}

export interface CountryDemographic {
  code: string;
  name: string;
  flagImage: string;
  customers: number;
  percentage: number;
}

interface DashboardState {
  metrics: MetricCard[];
  monthlySales: {
    categories: string[];
    data: number[];
  };
  statistics: {
    categories: string[];
    series: { name: string; data: number[] }[];
  };
  monthlyTarget: {
    percentage: number;
    target: string;
    revenue: string;
    today: string;
    message: string;
  };
  demographics: CountryDemographic[];
  recentOrders: OrderRow[];
}

const initialState: DashboardState = {
  metrics: [
    { label: "Customers", value: "3,782", growth: "11.01%", trend: "up" },
    { label: "Orders", value: "5,359", growth: "9.05%", trend: "down" },
  ],
  monthlySales: {
    categories: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
  },
  statistics: {
    categories: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    series: [
      { name: "Sales", data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235] },
      { name: "Revenue", data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140] },
    ],
  },
  monthlyTarget: {
    percentage: 75.55,
    target: "$20K",
    revenue: "$20K",
    today: "$20K",
    message:
      "You earn $3287 today, it's higher than last month. Keep up your good work!",
  },
  demographics: [
    {
      code: "US",
      name: "USA",
      flagImage: "/images/country/country-01.svg",
      customers: 2379,
      percentage: 79,
    },
    {
      code: "FR",
      name: "France",
      flagImage: "/images/country/country-02.svg",
      customers: 589,
      percentage: 23,
    },
  ],
  recentOrders: [
    {
      id: 1,
      name: "MacBook Pro 13”",
      variants: "2 Variants",
      category: "Laptop",
      price: "$2399.00",
      status: "Delivered",
      image: "/images/product/product-01.jpg",
    },
    {
      id: 2,
      name: "Apple Watch Ultra",
      variants: "1 Variant",
      category: "Watch",
      price: "$879.00",
      status: "Pending",
      image: "/images/product/product-02.jpg",
    },
    {
      id: 3,
      name: "iPhone 15 Pro Max",
      variants: "2 Variants",
      category: "SmartPhone",
      price: "$1869.00",
      status: "Delivered",
      image: "/images/product/product-03.jpg",
    },
    {
      id: 4,
      name: "iPad Pro 3rd Gen",
      variants: "2 Variants",
      category: "Electronics",
      price: "$1699.00",
      status: "Canceled",
      image: "/images/product/product-04.jpg",
    },
    {
      id: 5,
      name: "AirPods Pro 2nd Gen",
      variants: "1 Variant",
      category: "Accessories",
      price: "$240.00",
      status: "Delivered",
      image: "/images/product/product-05.jpg",
    },
  ],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
});

export default dashboardSlice.reducer;