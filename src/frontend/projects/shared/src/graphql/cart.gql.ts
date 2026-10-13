import { gql } from 'apollo-angular';

const CART_FIELDS = `
  id
  totalCents
  items {
    id
    quantity
    product { id name priceCents }
  }
`;

export const MY_CART = gql`
  query MyCart {
    myCart { ${CART_FIELDS} }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!) {
    addToCart(productId: $productId) { ${CART_FIELDS} }
  }
`;

export const CHECKOUT = gql`
  mutation Checkout {
    checkout {
      id
      totalCents
      status
    }
  }
`;

export interface CartDto {
  id: string;
  totalCents: number;
  items: { id: string; quantity: number; product: { id: string; name: string; priceCents: number } }[];
}

export interface OrderDto {
  id: string;
  totalCents: number;
  status: string;
}
