import { useState, useEffect } from "react";
import api from "../services/api";

export const usePrizes = () => {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/games/prizes")
      .then((res) => setPrizes(res.data.data))
      .catch(() => {
        // Fallback to hardcoded if API fails
        setPrizes(FALLBACK_PRIZES);
      })
      .finally(() => setLoading(false));
  }, []);

  return { prizes, loading };
};

// Fallback in case API is down
export const FALLBACK_PRIZES = [
  {
    name: "Lamborghini Urus",
    description: "The super SUV",
    prize_type: "car",
    estimated_value: 250000,
    image_url:
      "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&q=80",
  },
  {
    name: "Rolls-Royce Ghost",
    description: "Pinnacle of luxury",
    prize_type: "car",
    estimated_value: 350000,
    image_url:
      "https://images.unsplash.com/photo-1563720223809-b2ea5e4256b0?w=800&q=80",
  },
  {
    name: "Ferrari Roma",
    description: "Italian performance",
    prize_type: "car",
    estimated_value: 220000,
    image_url:
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
  },
  {
    name: "Manhattan Penthouse",
    description: "NYC skyline views",
    prize_type: "house",
    estimated_value: 2000000,
    image_url:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  },
  {
    name: "Malibu Beach House",
    description: "Beachfront in Malibu",
    prize_type: "house",
    estimated_value: 1500000,
    image_url:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
  },
  {
    name: "Miami Luxury Villa",
    description: "Pool villa Miami Beach",
    prize_type: "house",
    estimated_value: 1200000,
    image_url:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
  },
  {
    name: "Maldives 7 Nights",
    description: "Overwater bungalow",
    prize_type: "other",
    estimated_value: 25000,
    image_url:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
  },
  {
    name: "Paris Luxury Trip",
    description: "5-star Paris getaway",
    prize_type: "other",
    estimated_value: 15000,
    image_url:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  },
  {
    name: "Dubai VIP Experience",
    description: "All-inclusive Dubai",
    prize_type: "other",
    estimated_value: 20000,
    image_url:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  },
  {
    name: "Bali Honeymoon Suite",
    description: "Private villa Bali",
    prize_type: "other",
    estimated_value: 18000,
    image_url:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  },
  {
    name: "Tokyo Adventure",
    description: "7 nights Tokyo",
    prize_type: "other",
    estimated_value: 22000,
    image_url:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
  },
  {
    name: "Rolex Submariner",
    description: "Oystersteel classic",
    prize_type: "gadget",
    estimated_value: 40000,
    image_url:
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80",
  },
  {
    name: "Patek Philippe",
    description: "Most coveted watch",
    prize_type: "gadget",
    estimated_value: 80000,
    image_url:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
  },
  {
    name: "Audemars Piguet",
    description: "Royal Oak rose gold",
    prize_type: "gadget",
    estimated_value: 65000,
    image_url:
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
  },
  {
    name: "Sub-Zero Refrigerator",
    description: "Luxury fridge Wi-Fi",
    prize_type: "gadget",
    estimated_value: 12000,
    image_url:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80",
  },
  {
    name: "Miele Kitchen Suite",
    description: "Full kitchen set",
    prize_type: "gadget",
    estimated_value: 25000,
    image_url:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  },
  {
    name: "Louis Vuitton Set",
    description: "Trunk bags accessories",
    prize_type: "other",
    estimated_value: 30000,
    image_url:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
  },
  {
    name: "Cartier Necklace",
    description: "Diamond gold necklace",
    prize_type: "other",
    estimated_value: 55000,
    image_url:
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80",
  },
  {
    name: "MacBook Pro M4 Max",
    description: "128GB M4 Max chip",
    prize_type: "gadget",
    estimated_value: 8000,
    image_url:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
  },
  {
    name: "PS5 Pro Bundle",
    description: "10 games accessories",
    prize_type: "gadget",
    estimated_value: 2000,
    image_url:
      "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80",
  },
];
