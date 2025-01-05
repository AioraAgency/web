import { FC } from 'react';
import Image from 'next/image';

export interface Agent {
  id: string;
  name: string;
  clients: string[];
  imagePath?: string; // Optional since it's not in the API response
  tokenAddress?: string; // Optional token address for price tracking
}

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgent: Agent;
  onAgentChange: (agent: Agent) => void;
}

export const AgentSelector: FC<AgentSelectorProps> = ({
  agents,
  selectedAgent,
  onAgentChange,
}) => {
  // Helper function to get agent image path
  const getAgentImagePath = (name: string) => {
    // You can extend this mapping as needed
    const imageMap: { [key: string]: string } = {
      'aiora': '/anime-character.png',
      'default': '/default-agent.png'
    };
    return imageMap[name.toLowerCase()] || imageMap.default;
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Agent Image */}
      <div className="w-8 h-8 relative flex-shrink-0">
        <Image
          src={selectedAgent.imagePath || getAgentImagePath(selectedAgent.name)}
          alt={selectedAgent.name}
          width={32}
          height={32}
          className="rounded-full object-cover"
          priority
        />
      </div>
      
      {/* Price will be inserted here by parent component */}
      
      {/* Selector */}
      <select
        value={selectedAgent.id}
        onChange={(e) => {
          const agent = agents.find((a) => a.id === e.target.value);
          if (agent) onAgentChange(agent);
        }}
        className="appearance-none bg-black/30 border border-white/10 text-white rounded-lg px-4 py-2 pr-8 hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm"
      >
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name.toUpperCase()}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-0 flex items-center px-2 text-white">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}; 