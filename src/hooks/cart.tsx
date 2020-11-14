import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const currentCarS = await AsyncStorage.getItem('@GoMarketplace:car');
      if (currentCarS) {
        setProducts(JSON.parse(currentCarS));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    // console.log('chamando async');
    // AsyncStorage.setItem('@GoMarketplace:car', JSON.stringify(products));
  }, [products]);

  const saveAsyncStorage = useCallback(() => {
    AsyncStorage.setItem('@GoMarketplace:car', JSON.stringify(products));
  }, [products]);

  const increment = useCallback(
    async id => {
      const indexToIncrement = products.findIndex(product => product.id === id);
      if (indexToIncrement > -1) {
        const quantity = products[indexToIncrement].quantity + 1;

        const copyProducts = [...products];
        copyProducts[indexToIncrement] = {
          ...copyProducts[indexToIncrement],
          quantity,
        };
        setProducts(copyProducts);
        saveAsyncStorage();
      }
    },
    [products, saveAsyncStorage],
  );

  const decrement = useCallback(async id => {
    const indexToDecrement = products.findIndex(product => product.id === id);
    if (indexToDecrement > -1) {
      if (products[indexToDecrement].quantity === 1) {
        const newProducts = products.filter(procuct => procuct.id !== id);
        setProducts(newProducts);
        saveAsyncStorage();
      } else {
        const quantity = products[indexToDecrement].quantity - 1;

        const copyProducts = [...products];
        copyProducts[indexToDecrement] = {
          ...copyProducts[indexToDecrement],
          quantity,
        };
        setProducts(copyProducts);
        saveAsyncStorage();
      }
    }
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const existsProduct = products.find(prod => prod.id === product.id);
      if (existsProduct) {
        increment(existsProduct.id);
        saveAsyncStorage();
      } else {
        const newCar = [...products, { ...product, quantity: 1 }];
        setProducts(newCar);
        saveAsyncStorage();
      }
    },
    [increment, products, saveAsyncStorage],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
