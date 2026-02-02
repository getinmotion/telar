
import React from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { ChatBox } from './ChatBox';
import { Agent, Language } from './types';

interface ChatBoxCarouselProps {
  agents: Agent[];
  language: Language;
}

export const ChatBoxCarousel: React.FC<ChatBoxCarouselProps> = ({ agents, language }) => {
  return (
    <div className="relative w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {agents.map((agent) => (
            <CarouselItem key={agent.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <ChatBox agent={agent} language={language} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-center mt-4 gap-4">
          <CarouselPrevious className="static translate-y-0 bg-indigo-800/70 hover:bg-indigo-700/80 border-indigo-500/50 text-indigo-200 hover:text-white backdrop-blur-sm" />
          <CarouselNext className="static translate-y-0 bg-indigo-800/70 hover:bg-indigo-700/80 border-indigo-500/50 text-indigo-200 hover:text-white backdrop-blur-sm" />
        </div>
      </Carousel>
    </div>
  );
};
