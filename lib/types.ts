export interface ProductItem {
  naam: string;
  aantal: number;
  prijs: number;
}

export interface Order {
  id: string;
  naam: string;
  email: string;
  telefoonnummer: string;
  adres: string;
  producten: ProductItem[];
  bezorgmethode: string;
  betaalmethode: string;
  totaalprijs: number;
  created_at: string;
}
