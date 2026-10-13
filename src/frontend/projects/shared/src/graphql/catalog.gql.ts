import { gql } from 'apollo-angular';

export const LIST_PRODUCTS = gql`
  query ListProducts {
    listProducts {
      id
      sku
      name
      priceCents
      category { slug name }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      sku
      name
      priceCents
    }
  }
`;

export interface ProductDto {
  id: string;
  sku: string;
  name: string;
  priceCents: number;
  category: { slug: string; name: string };
}
