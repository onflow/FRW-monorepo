/**
 * Random username generator utility
 * Generates usernames using combinations of fruits, animals, nature words, and adjectives
 * Format: three words (no digits)
 */

const fruits = [
  'Apple',
  'Apricot',
  'Avocado',
  'Banana',
  'Blackberry',
  'Blueberry',
  'Cherry',
  'Coconut',
  'Cranberry',
  'Date',
  'Fig',
  'Grape',
  'Guava',
  'Kiwi',
  'Lemon',
  'Lime',
  'Mango',
  'Melon',
  'Nectarine',
  'Orange',
  'Papaya',
  'Peach',
  'Pear',
  'Pineapple',
  'Plum',
  'Pomegranate',
  'Raspberry',
  'Strawberry',
  'Tangerine',
  'Watermelon',
  'Cantaloupe',
  'Honeydew',
  'Persimmon',
  'Lychee',
  'Mulberry',
  'Kumquat',
  'Jackfruit',
  'Durian',
  'Passionfruit',
  'Pomelo',
  'Quince',
  'Mandarin',
  'Soursop',
  'Gooseberry',
  'Boysenberry',
  'Currant',
  'Tamarind',
  'Mangosteen',
  'Sapote',
  'Longan',
  'Starfruit',
];

const animals = [
  'Ant',
  'Bear',
  'Beaver',
  'Bee',
  'Bird',
  'Bobcat',
  'Buffalo',
  'Butterfly',
  'Camel',
  'Cat',
  'Cheetah',
  'Chicken',
  'Cobra',
  'Cow',
  'Crab',
  'Crocodile',
  'Deer',
  'Dog',
  'Dolphin',
  'Duck',
  'Eagle',
  'Elephant',
  'Falcon',
  'Ferret',
  'Fish',
  'Fox',
  'Frog',
  'Giraffe',
  'Goat',
  'Goose',
  'Hamster',
  'Hawk',
  'Hedgehog',
  'Hippo',
  'Horse',
  'Jaguar',
  'Jellyfish',
  'Kangaroo',
  'Koala',
  'Lemur',
  'Leopard',
  'Lion',
  'Lizard',
  'Llama',
  'Lobster',
  'Monkey',
  'Moose',
  'Mouse',
  'Octopus',
  'Otter',
  'Owl',
  'Panda',
  'Panther',
  'Parrot',
  'Penguin',
  'Pig',
  'Rabbit',
  'Raccoon',
  'Ram',
  'Rat',
  'Raven',
  'Seal',
  'Shark',
  'Sheep',
  'Skunk',
  'Sloth',
  'Snail',
  'Snake',
  'Spider',
  'Squirrel',
  'Tiger',
  'Toad',
  'Turtle',
  'Whale',
  'Wolf',
  'Wombat',
  'Zebra',
  'Antelope',
  'Armadillo',
  'Badger',
  'Bat',
  'Beetle',
  'Bison',
  'Boar',
  'Caribou',
  'Caterpillar',
  'Chameleon',
  'Chipmunk',
  'Clam',
  'Coyote',
  'Crow',
  'Donkey',
  'Dragonfly',
  'Eel',
  'Emu',
  'Falcon',
  'Firefly',
  'Gazelle',
  'Gecko',
  'Gopher',
  'Grouse',
  'Heron',
  'Hyena',
  'Iguana',
  'Jackal',
  'Jay',
  'Koi',
  'Lark',
  'Lynx',
  'Magpie',
  'Mallard',
  'Mantis',
  'Mink',
  'Mole',
  'Moth',
  'Narwhal',
  'Newt',
  'Ocelot',
  'Orca',
  'Pelican',
  'Pigeon',
  'Quail',
  'Raven',
  'Reindeer',
  'Robin',
  'Rooster',
  'Salmon',
  'Sardine',
  'Scorpion',
  'Sealion',
  'Shrimp',
  'Swan',
  'Tarantula',
  'Termite',
  'Toucan',
  'Trout',
  'Vulture',
  'Walrus',
  'Weasel',
  'Woodpecker',
  'Yak',
  'Zebu',
];

const nature = [
  'River',
  'Ocean',
  'Sky',
  'Cloud',
  'Rain',
  'Sun',
  'Moon',
  'Star',
  'Comet',
  'Breeze',
  'Storm',
  'Forest',
  'Tree',
  'Leaf',
  'Rock',
  'Stone',
  'Pebble',
  'Mountain',
  'Hill',
  'Valley',
  'Canyon',
  'Desert',
  'Sand',
  'Wave',
  'Tide',
  'Lake',
  'Pond',
  'Stream',
  'Coral',
  'Reef',
  'Glacier',
  'Aurora',
  'Shadow',
  'Light',
  'Flame',
  'Fire',
  'Smoke',
  'Mist',
  'Dawn',
  'Dusk',
  'Twilight',
  'Sunset',
  'Sunrise',
  'Field',
  'Garden',
  'Flower',
  'Petal',
  'Vine',
  'Root',
  'Branch',
  'Seed',
  'Berry',
  'Moss',
  'Fern',
  'Willow',
  'Oak',
  'Pine',
  'Maple',
  'Cedar',
  'Meadow',
  'Prairie',
  'Savanna',
  'Jungle',
  'Island',
  'Lagoon',
  'Bay',
  'Shore',
  'Cave',
  'Cliff',
  'Stone',
  'Crystal',
  'Gem',
  'Amber',
  'Pearl',
  'Quartz',
  'Sapphire',
  'Emerald',
  'Topaz',
  'Volcano',
  'Geyser',
  'Rainfall',
  'Snowflake',
  'Thunder',
  'Lightning',
  'Horizon',
  'Echo',
  'Boulder',
  'Dune',
  'Frost',
  'Aurora',
  'Galaxy',
  'Orbit',
  'Planet',
  'Meteor',
  'Cosmos',
];

const adjectives = [
  'Brave',
  'Calm',
  'Cheerful',
  'Clever',
  'Cool',
  'Cozy',
  'Curious',
  'Daring',
  'Delightful',
  'Eager',
  'Fancy',
  'Fearless',
  'Friendly',
  'Gentle',
  'Gleaming',
  'Glowing',
  'Golden',
  'Happy',
  'Humble',
  'Jolly',
  'Kind',
  'Lively',
  'Lucky',
  'Mellow',
  'Mighty',
  'Noble',
  'Peaceful',
  'Playful',
  'Polite',
  'Proud',
  'Quick',
  'Quiet',
  'Radiant',
  'Shiny',
  'Silly',
  'Smart',
  'Smiling',
  'Snug',
  'Sparkly',
  'Swift',
  'Thoughtful',
  'Tiny',
  'Vibrant',
  'Warm',
  'Witty',
  'Zany',
  'Bright',
  'Bold',
  'Charming',
  'Dazzling',
  'Dynamic',
  'Energetic',
  'Epic',
  'Fierce',
  'Gleeful',
  'Joyful',
  'Jubilant',
  'Lovely',
  'Majestic',
  'Merry',
  'Mirthful',
  'Neat',
  'Optimistic',
  'Peppy',
  'Plucky',
  'Posh',
  'Relaxed',
  'Serene',
  'Smooth',
  'Spunky',
  'Sunny',
  'Sweet',
  'Thrifty',
  'Tricky',
  'Upbeat',
  'Valiant',
  'Vivacious',
  'Whimsical',
  'Zealous',
];

const allWords = [...fruits, ...animals, ...nature, ...adjectives];

/**
 * Generates a secure random integer between 0 (inclusive) and maxExclusive (exclusive)
 * Uses crypto.getRandomValues for cryptographically secure randomness
 */
function secureRandomInt(maxExclusive: number): number {
  // For React Native, we need to check if crypto.getRandomValues is available
  // If not, fall back to Math.random (less secure but works everywhere)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % maxExclusive;
  }
  // Fallback for environments without crypto.getRandomValues
  return Math.floor(Math.random() * maxExclusive);
}

/**
 * Picks a random element from an array
 */
function pick<T>(arr: T[]): T {
  return arr[secureRandomInt(arr.length)];
}

/**
 * Generates a random username using three words
 * Format: [adjective]word1word2word3 or word1word2word3
 * If any word is an adjective, it's placed first
 * Avoids repeating the same word
 * Ensures username is between 3-15 characters as required by the API
 *
 * @returns A randomly generated username string (3-15 characters)
 */
export function generateRandomUsername(): string {
  // Filter to only short words (max 5 chars) to ensure 3 words fit in 15 chars
  const shortWords = allWords.filter((word) => word.length <= 5);

  let username = '';
  let attempts = 0;
  const maxAttempts = 100;

  // Keep trying until we get a valid username (3-15 chars)
  while (attempts < maxAttempts) {
    const word1 = pick(shortWords);
    let word2 = pick(shortWords);
    // Avoid repeating the same word
    while (word2 === word1) {
      word2 = pick(shortWords);
    }

    let word3 = pick(shortWords);
    // Avoid repeating words
    while (word3 === word1 || word3 === word2) {
      word3 = pick(shortWords);
    }

    // Check if any word is an adjective
    const words = [word1, word2, word3];
    const adjectiveIndex = words.findIndex((word) => adjectives.includes(word));

    if (adjectiveIndex !== -1) {
      // Put adjective first, then the other two words
      const adjective = words[adjectiveIndex];
      const otherWords = words.filter((_, index) => index !== adjectiveIndex);
      username = `${adjective}${otherWords[0]}${otherWords[1]}`;
    } else {
      // No adjective, just concatenate in order
      username = `${word1}${word2}${word3}`;
    }

    // Check if username meets length requirements (3-15 chars)
    if (username.length >= 3 && username.length <= 15) {
      return username;
    }

    attempts++;
  }

  // Fallback: if we somehow couldn't generate a valid username, use first 3 short words
  const fallback = shortWords.slice(0, 3).join('');
  return fallback.substring(0, 15); // Ensure max 15 chars
}
