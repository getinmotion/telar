
export type Language = 'en' | 'es';

// Agent interface to make our data more structured
export interface Agent {
  id: string;
  icon: JSX.Element;
  color: string;
  title: {
    en: string;
    es: string;
  };
  question: {
    en: string;
    es: string;
  };
  response: {
    en: string;
    es: string;
  };
  responseColor: string;
  chatEnabled?: boolean; // Property to indicate if this agent can chat
}
