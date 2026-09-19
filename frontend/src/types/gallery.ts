export interface GallerySection {
  eyebrow: string | null;
  title: string;
  instagram_handle: string | null;

  button_text: string | null;
  button_link: string | null;

  images: (string | null)[];

  is_active: boolean;
}

export interface GalleryApiResponse {
  success: boolean;
  data: GallerySection | null;
  message?: string;
}