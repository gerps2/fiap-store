import { gql } from 'apollo-angular';

export const MY_CART = gql`
  query MyCart {
    myCart {
      id
      totalCents
      items {
        id
        quantity
        product { id sku name priceCents imageUrl }
      }
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int = 1) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
      totalCents
      items {
        id
        quantity
        product { id sku name priceCents imageUrl }
      }
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($itemId: ID!, $quantity: Int!) {
    updateCartItem(itemId: $itemId, quantity: $quantity) {
      id
      totalCents
      items {
        id
        quantity
        product { id sku name priceCents imageUrl }
      }
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($itemId: ID!) {
    removeFromCart(itemId: $itemId) {
      id
      totalCents
      items {
        id
        quantity
        product { id sku name priceCents imageUrl }
      }
    }
  }
`;

export const CHECKOUT = gql`
  mutation Checkout {
    checkout {
      id
      totalCents
      status
      items { name quantity priceCents }
    }
  }
`;

export interface CartItemDto {
  id: string;
  quantity: number;
  product: { id: string; sku: string; name: string; priceCents: number; imageUrl: string | null };
}

export interface CartDto {
  id: string;
  totalCents: number;
  items: CartItemDto[];
}

export interface OrderDto {
  id: string;
  totalCents: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  items: { name: string; quantity: number; priceCents: number }[];
}
