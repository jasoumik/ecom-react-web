export type Banner = {
  id: string;
  src: string;
  alt: string;
  alt_bn?: string;
  link?: string;
  label_name?: string;
  label_name_bn?: string;
  label_color?: string;
};

export type HeroContent = {
  headline: string;
  headline_bn?: string;
  subheadline: string;
  subheadline_bn?: string;
  primaryCta: { label: string; label_bn?: string; href: string };
  secondaryCta?: { label: string; label_bn?: string; href: string };
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    priority?: boolean;
  };
  stats?: Array<{ label: string; label_bn?: string; value: string }>;
  banners?: Banner[];
};

export type TrustBadge = {
  id: string;
  label: string;
  label_bn?: string;
  iconUrl?: string;
  description?: string;
};

export type FeaturedProduct = {
  id: string;
  name: string;
  name_bn?: string;
  price: string;
  href: string;
  slug?: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  tag?: string;
  rating?: number;
  reviewCount?: number;
  mother_category_id?: string;
};

export type Reason = {
  id: string;
  iconUrl: string;
  title: string;
  title_bn?: string;
  description: string;
  description_bn?: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorRole?: string;
  avatar?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  rating?: number;
};

export type CallToActionContent = {
  title: string;
  title_bn?: string;
  subtitle?: string;
  subtitle_bn?: string;
  primaryCta: { label: string; label_bn?: string; href: string };
  secondaryText?: string;
};

export type Category = {
  id: string;
  name: string;
  name_bn?: string;
  image: string;
  slug?: string;
  mother_category_id?: string;
};

export type LandingPageContent = {
  hero: HeroContent;
  categories?: Category[];
  trustBadges: {
    title?: string;
    badges: TrustBadge[];
  };
  featuredProducts: {
    title: string;
    title_bn?: string;
    subtitle?: string;
    subtitle_bn?: string;
    products: FeaturedProduct[];
    viewAllHref?: string;
    slug?: string;
  };
  whyChooseUs: {
    title: string;
    title_bn?: string;
    reasons: Reason[];
  };
  testimonials: {
    title: string;
    title_bn?: string;
    items: Testimonial[];
    averageRating?: string;
    totalReviews?: number;
  };
  callToAction: CallToActionContent;
};
