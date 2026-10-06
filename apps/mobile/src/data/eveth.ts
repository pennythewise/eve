// All EVEth data is invented (PLACEHOLDER): fake places, fake owners, fake devices.

export interface EveDevice {
  id: string;
  name: string;
  emoji: string;
  owner: string;
  place: string;
  lat: number;
  lng: number;
  color: string;
  story: string;
  /** "Where it went" stops, oldest first. */
  journey: { title: string; meta: string }[];
  likes: number;
  comments: { user: string; text: string }[];
  mine?: boolean;
}

export const MY_DEVICE_ID = 'EVE-PHN-00112';
export const DEFAULT_INTRO = "Hi, I'm a cracked old phone. I took a lot of photos, survived a few drops, and now I'm helping build something new.";

export const EVETH_DEVICES: EveDevice[] = [
  {
    id: MY_DEVICE_ID, name: 'Old phone', emoji: '📱', owner: 'You', place: 'Teal Harbour', lat: 8, lng: 20, color: '#0A9C8A', mine: true,
    story: DEFAULT_INTRO,
    journey: [
      { title: 'Retired from daily use', meta: 'Cracked screen, battery fading' },
      { title: 'Picked up by driver Aiman', meta: 'Confirmed by both sides' },
      { title: 'Recycled at a licensed facility', meta: 'Recovered 182 g of material' },
    ],
    likes: 3, comments: [{ user: 'mei', text: 'That crack has character.' }],
  },
  {
    id: 'EVE-LAP-00231', name: 'Sticker-bomb laptop', emoji: '💻', owner: 'Jun', place: 'Sticker Bay', lat: 32, lng: -48, color: '#E8A317',
    story: 'I was stuck with every hackathon sticker my owner collected throughout college. Every sticker is a weekend without sleep, a demo that almost crashed, and a team that became friends.',
    journey: [
      { title: 'Bought for freshman year', meta: 'Plain silver lid' },
      { title: 'Covered in hackathon stickers', meta: '41 stickers over four years' },
      { title: 'Retired after graduation', meta: 'Hinge finally gave up' },
      { title: 'Recovered 640 g of material', meta: 'Aluminium and copper sent to a manufacturer' },
    ],
    likes: 128, comments: [{ user: 'dev_ana', text: 'The MLH sticker in the corner got me.' }, { user: 'kai', text: 'Respect. 41 stickers is a lot of weekends.' }],
  },
  {
    id: 'EVE-FRG-00077', name: 'Frosty the fridge', emoji: '🧊', owner: 'Auntie Lim', place: 'Chilly Peaks', lat: 62, lng: 110, color: '#4FA3E8',
    story: 'I kept the family dinners cold for 19 years, with a magnet from every holiday on my door. My compressor finally hummed its last tune.',
    journey: [
      { title: 'Kept the kitchen cold', meta: '19 years of leftovers' },
      { title: 'Collected from a flat in Chilly Peaks', meta: 'Refrigerant safely removed' },
      { title: 'Copper coil recovered', meta: 'Now part of a new coil' },
    ],
    likes: 54, comments: [{ user: 'sam', text: 'Nineteen years! Mine died at five.' }],
  },
  {
    id: 'EVE-OVN-00040', name: 'Retired oven', emoji: '🍞', owner: 'Hakim', place: 'Ovenia', lat: -18, lng: 95, color: '#E86A4F',
    story: 'I baked the first loaf my owner ever got right, after nine that did not. I am proud of loaf ten.',
    journey: [
      { title: 'Baked loaf number ten', meta: 'The good one' },
      { title: 'Heating element failed', meta: 'Not worth repairing' },
      { title: 'Steel recovered', meta: '2.1 kg sent for reuse' },
    ],
    likes: 31, comments: [],
  },
  {
    id: 'EVE-MBD-00019', name: 'Motherboard', emoji: '🧠', owner: 'Priya', place: 'Solder Springs', lat: -34, lng: -20, color: '#9B6BE8',
    story: 'I was the brain of a gaming PC built during lockdown. My owner learned to solder on my little brother, the old one, before touching me.',
    journey: [
      { title: 'Built into a gaming PC', meta: 'Lockdown project' },
      { title: 'Upgraded out', meta: 'Replaced by a newer board' },
      { title: 'Gold and copper recovered', meta: 'Traces reclaimed at a smelter' },
    ],
    likes: 77, comments: [{ user: 'rin', text: 'Soldering on the old one first is the right way.' }],
  },
  {
    id: 'EVE-HDP-00093', name: 'Concert headphones', emoji: '🎧', owner: 'Zara', place: 'Cable Coast', lat: 14, lng: -120, color: '#E86AB0',
    story: 'I was there for every playlist during exam season. The left ear cup has not worked since the finals of year two, and I kept going anyway.',
    journey: [
      { title: 'Exam season soundtrack', meta: 'Two years, one working ear' },
      { title: 'Dropped at a collection point', meta: 'Cable Coast drop-off' },
      { title: 'Plastic and copper recovered', meta: '120 g' },
    ],
    likes: 42, comments: [],
  },
];
