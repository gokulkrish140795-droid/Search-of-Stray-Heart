export interface CardItem {
  id: string;
  chapter: 1 | 2 | 3;
  step: number;
  letters: string;
  location: string;
  bypass: string[];
  quote: string;
  miniMe: string;
  riddle: string[];
}

export interface VaultItem {
  chapter: 1 | 2 | 3;
  step: number;
  password: string;
  bypass: string[];
  location: string;
  soundName: string;
  miniMe: string;
  riddle: string[];
}

export const CHAPTER_CONFIG = {
  1: {
    roman: 'I',
    title: 'Everyday Comforts & Routines',
    accent: '#E8C56A', // Gold
    bgGradient: 'from-amber-950/30 to-slate-950',
    vaultPassword: 'MICROWAVECUPBOARD',
  },
  2: {
    roman: 'II',
    title: 'Midnight Detective',
    accent: '#7EF0FF', // Cyan
    bgGradient: 'from-cyan-950/30 to-slate-950',
    vaultPassword: 'GOLDJEWELRYPOUCH',
  },
  3: {
    roman: 'III',
    title: 'The Road Trip Finale',
    accent: '#FF6B8A', // Rose
    bgGradient: 'from-rose-950/30 to-slate-950',
    vaultPassword: 'UNDERSTAIRS',
  },
};

export const HUNT_CARDS: CardItem[] = [
  // CHAPTER 1 (Steps 1–9)
  {
    id: '01',
    chapter: 1,
    step: 1,
    letters: 'M - I - X',
    location: 'Behind the large standing mirror',
    bypass: ['mirror', 'standing mirror'],
    quote: 'Your morning smile makes every single day beautiful...',
    miniMe: "Aishwarya! Thank goodness you're here. A little piece of Gokul's heart drifted away while he was thinking about how much he loves you! Let's start our quest where your beautiful smile shines back at you every single morning before we step out...",
    riddle: [
      'I look right back at you with every sweet view,',
      'Showing the beauty that Gokul loves in you.',
      'I hold your reflection from morning to night,',
      'Check right behind me, just out of your sight!',
    ],
  },
  {
    id: '02',
    chapter: 1,
    step: 2,
    letters: 'C - R - Y',
    location: 'Under a cushion on the lounge sofa',
    bypass: ['sofa', 'lounge sofa', 'cushion'],
    quote: 'Our favorite quiet place to drift off together on lazy movie nights...',
    miniMe: "Yay! You unlocked the first step! But the magic is still wandering. It's headed to our ultimate comfort zone, the exact spot where we drift off together on lazy weekends...",
    riddle: [
      'Our favorite spot when the evening grows late,',
      'For cozy movie nights and a stay-at-home date.',
      'Where we sit side-by-side on cushions so neat—',
      'Lift one up gently to find your next treat!',
    ],
  },
  {
    id: '03',
    chapter: 1,
    step: 3,
    letters: 'O - W',
    location: 'Taped under the computer table',
    bypass: ['computer table', 'desk', 'table'],
    quote: 'For the girl with the big dreams, pure fire, and two degrees...',
    miniMe: 'Brilliant tracking! Next, a tiny spark of love decided to visit the main command center. It wanted to hide right where your bright thoughts, ambitions, and big ideas happen...',
    riddle: [
      'Where your laptop sits and your bright ideas flow,',
      "Working hard on your dreams in the screen's soft glow.",
      "The token you seek isn't resting on top—",
      'Reach right underneath where your workdays all stop!',
    ],
  },
  {
    id: '04',
    chapter: 1,
    step: 4,
    letters: 'A - V - Z',
    location: 'Behind the living room curtain',
    bypass: ['curtain', 'living room curtain'],
    quote: 'Peeking out at the world, but my absolute favorite view is always you...',
    miniMe: "You're getting so good at this! For our fourth little stop, the magic has drifted over toward the windows where the soft daylight comes into our lounge...",
    riddle: [
      'I hang by the window to frame up the view,',
      'Soft fabric that gathers when day is all new.',
      "Don't look through the glass or out at the street—",
      'Just peek right behind me to find your next treat!',
    ],
  },
  {
    id: '05',
    chapter: 1,
    step: 5,
    letters: 'E - C',
    location: 'Inside one of the pooja drawers',
    bypass: ['pooja drawer', 'pooja', 'drawer'],
    quote: 'Deeply blessed to stand beside you in peace, love, and infinite gratitude...',
    miniMe: "Beautiful! We are halfway through the first chapter. For this next anchor, let's visit our quiet space of gratitude, peace, and sacred family blessings...",
    riddle: [
      'The most peaceful corner where blessings abide,',
      'Where we say our sweet prayers with love by our side.',
      'Slide open the drawer in this beautiful space,',
      'To find the next token of warmth and of grace.',
    ],
  },
  {
    id: '06',
    chapter: 1,
    step: 6,
    letters: 'U - P',
    location: 'Inside the kitchen cutlery drawer',
    bypass: ['cutlery drawer', 'cutlery', 'spoon drawer'],
    quote: 'Every single simple dinner becomes an absolute feast when I share it with you...',
    miniMe: "Six down, you are flying through this! For our next stop, the magic has drifted into the heart of the kitchen, right where we grab our everyday forks and spoons for delicious meals together...",
    riddle: [
      'Where the silver is kept and the spoons all reside,',
      'For the comfort and joy that our dinners provide.',
      'No custom tricks here, just the daily routine—',
      'Slide open the drawer where the cutlery is clean!',
    ],
  },
  {
    id: '07',
    chapter: 1,
    step: 7,
    letters: 'B - O',
    location: 'Inside her favorite plush toy bear',
    bypass: ['teddy bear', 'plush bear', 'bear'],
    quote: 'Cuddling up tightly since the very first months of our beautiful story...',
    miniMe: "Beautifully found! Now, let's look for a very special, cuddly friend who has been guarding our sweetest memories right from the absolute beginning of our story...",
    riddle: [
      'A soft little friend from our first month together,',
      'Keeping us cozy in all kinds of weather.',
      'Gifted with love for our special milestone,',
      'Peek inside his soft paws for a token unknown!',
    ],
  },
  {
    id: '08',
    chapter: 1,
    step: 8,
    letters: 'A - R',
    location: 'Inside your dressing wardrobe (husband side)',
    bypass: ['wardrobe', 'closet', 'dressing wardrobe'],
    quote: 'A little bit of my heart tucked safely inside your favorite cozy space...',
    miniMe: "You're unstoppable! For Step 8, the little heart decided to sneak into my very own side of the closet. It wanted to hide among the things that smell like me...",
    riddle: [
      'Where Gokul hangs up his shirts and his clothes,',
      'A space in the bedroom that everyone knows.',
      'Open the doors where my jackets all stay,',
      'Tucked right inside is the next step of the day!',
    ],
  },
  {
    id: '09',
    chapter: 1,
    step: 9,
    letters: 'D - Q',
    location: 'Taped underneath one of the dining chairs',
    bypass: ['chair', 'dining chair'],
    quote: 'Pulling up a seat for a lifetime of laughter, road trips, and dates...',
    miniMe: "Aha! Just two more steps until the first grand vault opens! Let's head back to where we sit down to share our stories, laughter, and warm dinners...",
    riddle: [
      'Where we sit at the table to talk and to eat,',
      'Resting our legs and pulling up a seat.',
      "Don't look on the cushion, that's far too upfront—",
      'Reach right underneath for a hidden-zone hunt!',
    ],
  },

  // CHAPTER 2 (Steps 11–19)
  {
    id: '11',
    chapter: 2,
    step: 11,
    letters: 'G - O - F',
    location: 'Inside the fridge',
    bypass: ['fridge', 'refrigerator'],
    quote: 'For my sweet midnight snacking, ice-cream loving partner-in-crime...',
    miniMe: 'Detective hat on. Chapter 2 is a proper investigation. A chilly little heart snuck into the coldest corner of our kitchen.',
    riddle: [
      'I hum through the night with a frosty glow,',
      'Keeping midnight snacks in a neat little row.',
      'Open my door where the cold air spills —',
      'Your next clue is hiding among the chills.',
    ],
  },
  {
    id: '12',
    chapter: 2,
    step: 12,
    letters: 'L - D',
    location: 'Inside the sofa cover fabric layer',
    bypass: ['sofa cover', 'sofa fabric'],
    quote: 'Tucked deeply inside our cozy weekend comfort zone on the rug...',
    miniMe: 'Clever girl. Same sofa as Act I — but not under the cushion this time. Deeper. Between the cover and the comfort.',
    riddle: [
      'We wrap ourselves up when the weekend is slow,',
      'A second soft layer where comfort can grow.',
      "Slip your hand into the fabric's disguise —",
      'A secret is stitched where the sofa-cover lies.',
    ],
  },
  {
    id: '13',
    chapter: 2,
    step: 13,
    letters: 'J - E - K',
    location: 'The toilet mirror cabinet',
    bypass: ['mirror cabinet', 'toilet mirror cabinet', 'bathroom cabinet'],
    quote: 'Glow on, gorgeous! You take my absolute breath away every single day...',
    miniMe: 'Glow-up stop. The heart wanted a front-row seat to your skincare throne.',
    riddle: [
      'I hide behind glass after you wash your face,',
      'Little bottles of glow in a tiny cabinet space.',
      'Swing open the mirror that keeps your routine —',
      'A token is waiting backstage, unseen.',
    ],
  },
  {
    id: '14',
    chapter: 2,
    step: 14,
    letters: 'W - E',
    location: 'Inside her Dyson Airwrap iD 2 box',
    bypass: ['dyson', 'dyson box', 'airwrap'],
    quote: 'Your gorgeous, soft curls, styled perfectly with your magical golden touch...',
    miniMe: 'Next: a very fancy box that makes your hair look like a premiere.',
    riddle: [
      'A magic wand lives in a branded keep,',
      'The one that styles curls while the world is asleep.',
      "Open the Airwrap's box with care —",
      'Your gorgeous secret is waiting in there.',
    ],
  },
  {
    id: '15',
    chapter: 2,
    step: 15,
    letters: 'L - R',
    location: 'Inside a board game box on the shelf',
    bypass: ['board game', 'boardgame', 'game box'],
    quote: 'Winning at board games, but I already won the ultimate grand prize with you...',
    miniMe: "Let's play. I already won the grand prize. There's still a card in the box.",
    riddle: [
      'Dice, cards, and laughter stacked high on the shelf,',
      'Where we battle for points and then tease one another.',
      'Lift the lid of a game we both know —',
      'A letter is hiding inside the next throw.',
    ],
  },
  {
    id: '16',
    chapter: 2,
    step: 16,
    letters: 'Y - P',
    location: 'Deep inside one of her shoes',
    bypass: ['shoe', 'shoes'],
    quote: 'Every single step taken right beside you is my favorite landscape...',
    miniMe: 'Every step beside you is my favorite destination. Check the footwear that actually goes places.',
    riddle: [
      'Laces and leather that walk us through days,',
      'Adventures and errands and soft rainy ways.',
      'Reach deep in a shoe you wear out the door —',
      'A tiny heart token is waiting for more.',
    ],
  },
  {
    id: '17',
    chapter: 2,
    step: 17,
    letters: 'O - U',
    location: 'Behind the 1st month marriage anniversary photo frame',
    bypass: ['photo frame', 'anniversary frame', 'marriage photo'],
    quote: 'Right where our beautiful, sweet happily-ever-after officially took off...',
    miniMe: 'This one is tender. Go where our forever officially began on paper and in a frame.',
    riddle: [
      'A month of new marriage in a frame on the wall,',
      'Two faces, one vow, and the start of it all.',
      'Peek just behind where that memory stays —',
      'The next little letter is hiding in the haze.',
    ],
  },
  {
    id: '18',
    chapter: 2,
    step: 18,
    letters: 'C - H',
    location: 'Inside the beauty cabinet top shelf',
    bypass: ['beauty cabinet', 'makeup cabinet'],
    quote: 'Absolutely striking... my real-life queen dressed up for our magical evenings...',
    miniMe: 'My real-life queen. Check the top shelf of your beauty kingdom.',
    riddle: [
      'Lipsticks and palettes, a crown of your own,',
      'The cabinet where evenings of sparkle are sewn.',
      'Look on the top shelf, above all the glam —',
      'A clue is perched right where the glowings began.',
    ],
  },
  {
    id: '19',
    chapter: 2,
    step: 19,
    letters: 'S - P - A - R - K',
    location: 'Underneath a plant on the first row of the plant shelf',
    bypass: ['plant', 'plant shelf', 'pot'],
    quote: 'Growing stronger, greener, and infinitely more beautiful together every year...',
    miniMe: 'Gokul may have planted this one. Lift a plant... then trust your detective brain. Not every letter is evidence.',
    riddle: [
      'Green leaves that drink up the afternoon light,',
      'Growing beside us, quiet and bright.',
      "Lift the pot gently — letters you'll see —",
      'But not every letter is meant to run free.',
    ],
  },

  // CHAPTER 3 (Steps 21–29)
  {
    id: '21',
    chapter: 3,
    step: 21,
    letters: 'U - B',
    location: 'Underneath the subwoofer next to the TV cabinet',
    bypass: ['subwoofer', 'speaker', 'tv cabinet'],
    quote: 'The deep, heavy rumble of my heart whenever you enter our home...',
    miniMe: 'Aviator sunglasses on. Act III is a road-trip finale. Feel the bass beside the TV cabinet.',
    riddle: [
      'I boom by the telly with a rumble so deep,',
      'The sound of a heartbeat you feel in your feet.',
      'Check underneath where the subwoofer sits —',
      'A travel-day token is hiding in the pits.',
    ],
  },
  {
    id: '22',
    chapter: 3,
    step: 22,
    letters: 'N - G',
    location: 'Behind the family photo at Blue Spring Falls',
    bypass: ['blue springs', 'blue spring falls', 'family photo'],
    quote: 'Love as pure, crystal-clear, and breathtaking as the turquoise flowing streams...',
    miniMe: 'As pure as those turquoise waters. Find the frame from that day.',
    riddle: [
      'Turquoise and still, a waterfall frame,',
      'A day we stood small beside something that came',
      'from the earth as a blessing. Look just behind —',
      'The next letter waits where the blue water shined.',
    ],
  },
  {
    id: '23',
    chapter: 3,
    step: 23,
    letters: 'D - J',
    location: "Behind her late uncle's photo frame",
    bypass: ['uncle', 'uncle photo', 'photo frame'],
    quote: 'A timeless love that watches over us, warm, protective, and eternally bright...',
    miniMe: 'Softly now. A love that still watches over us is holding the next piece.',
    riddle: [
      'A face that we love, in a frame kept with care,',
      'Warmth from a story that still fills the air.',
      'Gently look behind where that portrait is placed —',
      'A blessing is hiding in that sacred space.',
    ],
  },
  {
    id: '24',
    chapter: 3,
    step: 24,
    letters: 'E - W',
    location: 'Lower shelf of laundry/storage sliding door cabinet',
    bypass: ['laundry cabinet', 'laundry shelf', 'sliding door cabinet'],
    quote: "Even doing the silly daily chores is a blast when I'm doing them beside you...",
    miniMe: 'Even chores are cute with you. Sliding doors. Lower shelf.',
    riddle: [
      'Sliding doors, towels, and laundry-day steam,',
      'The cabinet of ordinary, everyday gleam.',
      'Check a low shelf where the baskets all hide —',
      'A letter is folded with socks side by side.',
    ],
  },
  {
    id: '25',
    chapter: 3,
    step: 25,
    letters: 'R - R - M',
    location: 'Behind cleaning bottles under the kitchen sink',
    bypass: ['under kitchen sink', 'kitchen sink', 'cleaning bottles', 'sink'],
    quote: 'Stirring up a lifetime of warm, delicious, and sweet couple memories...',
    miniMe: 'Chef mode. Deep under the sink, behind the cleaning bottles.',
    riddle: [
      'Bubbles and bottles, a cupboard of clean,',
      'The messiest magic behind a routine.',
      'Reach past the sprays to the back of the cave —',
      'A clue is camping where the pipes misbehave.',
    ],
  },
  {
    id: '26',
    chapter: 3,
    step: 26,
    letters: 'S - S - O',
    location: 'Flat beneath her luxury perfume display stand',
    bypass: ['perfume stand', 'perfume display', 'perfume'],
    quote: 'My favorite fragrance is the sweet scent of your warm morning embrace...',
    miniMe: 'My favorite fragrance is still your hug. Slide a card flat under the perfume stand.',
    riddle: [
      'Glass bottles standing like a little parade,',
      'The scent of a night when we both got dressed up.',
      'Slide a card flat beneath the display —',
      'A sweet little letter is tucked under the tray.',
    ],
  },
  {
    id: '27',
    chapter: 3,
    step: 27,
    letters: 'T - C',
    location: 'Inside your camera backpack (Canon 50mm slot)',
    bypass: ['camera bag', 'camera backpack', 'canon 50mm', 'backpack'],
    quote: 'Through every camera lens, you are the most stunning and radiant light...',
    miniMe: 'Through every lens, you are the shot. Check next to the Canon 50mm slot.',
    riddle: [
      'A backpack of glass, a Canon companion,',
      'The 50mm nest where the portraits begin.',
      'Feel in the slot by the lens that you love —',
      'A token is traveling in that camera glove.',
    ],
  },
  {
    id: '28',
    chapter: 3,
    step: 28,
    letters: 'A - V',
    location: 'Behind the car front passenger seat pocket flap (Toyota RAV4 2024)',
    bypass: ['passenger seat', 'seat pocket', 'car seat'],
    quote: 'My ultimate road trip co-pilot, fast asleep or wide awake, my favorite partner...',
    miniMe: 'Ultimate co-pilot. Even when you fall asleep on the drive. Seat-back pocket.',
    riddle: [
      'Shotgun forever, the passenger throne,',
      'Maps, snacks, and playlists, a kingdom of your own.',
      'Check the seat-back pocket, the flap at your knees —',
      'A road-trip clue waits in that fabric of ease.',
    ],
  },
  {
    id: '29',
    chapter: 3,
    step: 29,
    letters: 'I - H',
    location: 'In the car boot (Toyota RAV4 2024)',
    bypass: ['car boot', 'boot', 'car key chain', 'trunk'],
    quote: 'Packed up and ready for our next epic, hand-in-hand scenic road adventure...',
    miniMe: 'Suitcases. Next adventure. Hand in hand. One last letter before the grand anagram.',
    riddle: [
      'The boot of the car where the journeys all start,',
      'Luggage and blankets and maps of the heart.',
      'Lift the latch, peek where the suitcases sleep —',
      'One last letter waits in the travel-day keep.',
    ],
  },
];

export const HUNT_VAULTS: VaultItem[] = [
  {
    chapter: 1,
    step: 10,
    password: 'MICROWAVECUPBOARD',
    bypass: ['microwave cupboard', 'microwave'],
    location: 'Microwave cupboard',
    soundName: 'Latch Click',
    miniMe:
      'Oh my goodness, Aishwarya, you found all the letters for this chapter! Look at your scrapbook screen—the letters are ready! Unscramble them to figure out exactly where your first milestone gift is hiding!',
    riddle: [
      "You've gathered the letters and solved the big race,",
      'Now bring them all back to one warm kitchen space.',
      'Where we heat up our snacks when the evening gets late,',
      'Open the cupboard to unlock the vault gate!',
    ],
  },
  {
    chapter: 2,
    step: 20,
    password: 'GOLDJEWELRYPOUCH',
    bypass: ['gold pouch', 'gold jewelry pouch', 'jewelry pouch'],
    location: 'Inside the gold jewelry pouch',
    soundName: 'Velvet Pocket',
    miniMe:
      "The case board is full! Unscramble GOLDJEWELRYPOUCH — and throw away the Auckland wind-traps, including Gokul's SPARK prank!",
    riddle: [
      'Not every letter belongs in the prize.',
      'Some blew in on Auckland weather.',
      "Spell the vault that holds a queen's sparkle,",
      'Then find the gold pouch and look inside.',
    ],
  },
  {
    chapter: 3,
    step: 30,
    password: 'UNDERSTAIRS',
    bypass: ['understairs', 'under stairs', 'under-stairs storage'],
    location: 'Storage door by the pet-food area (gateway to under-stairs vault)',
    soundName: 'Stairs Dust Drift',
    miniMe:
      'Thirty years of magic, thirty steps of hunt. Lay the letters on the floor. Throw the Wellington decoys. The master door is the one you walk over every day.',
    riddle: [
      'Not in a cupboard, not in a car.',
      'A secret room lives where the staircase is.',
      'Spell the hiding place, then open the storage',
      'under the stairs — the stray heart is home.',
    ],
  },
];

export const FINALE_PROTOCOL = {
  code: '0510',
  meaning: '5th October (Birthday Protocol)',
  finalCaption: 'Look up.',
  gokulGiftNote: 'Gokul is the gift.',
};
