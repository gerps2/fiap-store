import { gql } from 'apollo-angular';

export const LIST_PRODUCTS = gql`
  query ListProducts($search: String, $category: String) {
    listProducts(search: $search, category: $category) {
      id
      sku
      name
      description
      priceCents
      imageUrl
      category { slug name }
    }
  }
`;

export const LIST_CATEGORIES = gql`
  query Categories {
    categories { slug name }
  }
`;

export interface ProductDto {
  id: string;
  sku: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  category: { slug: string; name: string };
}

export interface CategoryDto {
  slug: string;
  name: string;
}
