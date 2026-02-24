
export interface Message {
  type: 'user' | 'agent' | 'ai';
  content: string;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  avatar?: React.ReactNode;
  color: string;
  greeting: string;
}
