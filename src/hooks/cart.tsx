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
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  // console.log(products);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketplace:cart');
      AsyncStorage.clear();

      console.log({ cart });

      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      // TODO ADD A NEW ITEM TO THE CART

      const match = products.find(prod => prod.id === product.id);

      if (match) {
        const updatedProduct = {
          id: match.id,
          title: match.title,
          image_url: match.image_url,
          price: match.price,
          quantity: match.quantity + 1,
        };
        return;
      }

      const productInCart = {
        id: product.id,
        title: product.title,
        image_url: product.image_url,
        price: product.price,
        quantity: 1,
      };

      setProducts(prevState => {
        return [...prevState, productInCart];
      });

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productInCart),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const product = products.find(prod => prod.id === id);

      if (product) {
        product.quantity += 1;
      }

      const updatedProducts = products.map(prod => {
        if (prod.id === id) {
          return product;
        }
        return prod;
      });

      setProducts(updatedProducts);

      await AsyncStorage.setItem(
        'GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(prod => prod.id === id);

      if (product) {
        product.quantity = product.quantity === 0 ? 0 : product?.quantity - 1;
      }

      const updatedProducts = products.map(prod => {
        if (prod.id === id) {
          return product;
        }
        return prod;
      });

      setProducts(updatedProducts);

      await AsyncStorage.setItem(
        'GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
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
