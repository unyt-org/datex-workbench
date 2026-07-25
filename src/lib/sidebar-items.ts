import { ArrowLeftRight, SendToBack, Terminal, Box, GitGraph, Info, EthernetPort } from 'lucide-vue-next';

export const sidebarItems = [
    { icon: Terminal, key: 'repl', path: '/repl', label: 'nav.repl', description: 'welcome.replDesc' },
    { icon: EthernetPort, key: 'comhub', path: '/comhub', label: 'nav.comhub', description: 'welcome.comhubDesc' },
    { icon: SendToBack, key: 'networkVisualizer', path: '/network-visualizer', label: 'nav.networkVisualizer', description: 'welcome.networkVisualizerDesc' },
    { icon: Box, key: 'block', path: '/block', label: 'nav.block', description: 'welcome.blockDesc' },
    { icon: ArrowLeftRight, key: 'networkInspector', path: '/network', label: 'nav.networkInspector', description: 'welcome.networkDesc' },
    { icon: GitGraph, key: 'nodeView', path: '/node-view', label: 'nav.nodeView', description: 'welcome.nodeDesc' },
    { icon: Info, key: 'about', path: '/about', label: 'nav.about', description: 'welcome.aboutDesc' },
];
