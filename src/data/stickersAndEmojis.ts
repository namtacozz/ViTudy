export interface StickerPickerItem {
  id: string;
  name: string;
  type: 'emoji' | 'sticker' | 'gif';
  content: string;
  url?: string;
  isSvg?: boolean;
  category?: string;
  width?: number;
  height?: number;
}

export interface EmojiCategory {
  id: string;
  label: string;
  icon: string;
  items: StickerPickerItem[];
}

export interface StickerCategory {
  id: string;
  label: string;
  icon: string;
  items: StickerPickerItem[];
}

// =========================================================================
// 1. COMPREHENSIVE EMOJI CATEGORIES (Miro Style - Image 1)
// =========================================================================
export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'people',
    label: 'Smileys & People',
    icon: '😀',
    items: [
      { id: 'em-grinning', name: 'Grinning Face', type: 'emoji', content: '😀' },
      { id: 'em-smiley', name: 'Grinning Face with Big Eyes', type: 'emoji', content: '😃' },
      { id: 'em-smile', name: 'Grinning Face with Smiling Eyes', type: 'emoji', content: '😄' },
      { id: 'em-beam', name: 'Beaming Face', type: 'emoji', content: '😁' },
      { id: 'em-laughing', name: 'Grinning Squinting Face', type: 'emoji', content: '😆' },
      { id: 'em-sweat-smile', name: 'Grinning Face with Sweat', type: 'emoji', content: '😅' },
      { id: 'em-joy', name: 'Face with Tears of Joy', type: 'emoji', content: '😂' },
      { id: 'em-rofl', name: 'Rolling on the Floor Laughing', type: 'emoji', content: '🤣' },
      { id: 'em-blush', name: 'Smiling Face with Smiling Eyes', type: 'emoji', content: '😊' },
      { id: 'em-innocent', name: 'Smiling Face with Halo', type: 'emoji', content: '😇' },
      { id: 'em-slight-smile', name: 'Slightly Smiling Face', type: 'emoji', content: '🙂' },
      { id: 'em-upside-down', name: 'Upside-Down Face', type: 'emoji', content: '🙃' },
      { id: 'em-wink', name: 'Winking Face', type: 'emoji', content: '😉' },
      { id: 'em-relieved', name: 'Relieved Face', type: 'emoji', content: '😌' },
      { id: 'em-heart-eyes', name: 'Heart Eyes', type: 'emoji', content: '😍' },
      { id: 'em-stars', name: 'Star-Struck', type: 'emoji', content: '🤩' },
      { id: 'em-kissing-heart', name: 'Blowing Kiss', type: 'emoji', content: '😘' },
      { id: 'em-kissing', name: 'Kissing Face', type: 'emoji', content: '😗' },
      { id: 'em-yum', name: 'Savoring Food', type: 'emoji', content: '😋' },
      { id: 'em-stuck-out-tongue', name: 'Face with Tongue', type: 'emoji', content: '😛' },
      { id: 'em-zany', name: 'Zany Face', type: 'emoji', content: '🤪' },
      { id: 'em-money-mouth', name: 'Money-Mouth Face', type: 'emoji', content: '🤑' },
      { id: 'em-hugging', name: 'Hugging Face', type: 'emoji', content: '🤗' },
      { id: 'em-shushing', name: 'Shushing Face', type: 'emoji', content: '🤫' },
      { id: 'em-thinking', name: 'Thinking Face', type: 'emoji', content: '🤔' },
      { id: 'em-zipper', name: 'Zipper-Mouth Face', type: 'emoji', content: '🤐' },
      { id: 'em-raised-eyebrow', name: 'Face with Raised Eyebrow', type: 'emoji', content: '🤨' },
      { id: 'em-neutral', name: 'Neutral Face', type: 'emoji', content: '😐' },
      { id: 'em-expressionless', name: 'Expressionless Face', type: 'emoji', content: '😑' },
      { id: 'em-smirk', name: 'Smirking Face', type: 'emoji', content: '😏' },
      { id: 'em-unamused', name: 'Unamused Face', type: 'emoji', content: '😒' },
      { id: 'em-rolling-eyes', name: 'Face with Rolling Eyes', type: 'emoji', content: '🙄' },
      { id: 'em-grimacing', name: 'Grimacing Face', type: 'emoji', content: '😬' },
      { id: 'em-lying', name: 'Lying Face', type: 'emoji', content: '🤥' },
      { id: 'em-pensive', name: 'Pensive Face', type: 'emoji', content: '😔' },
      { id: 'em-sleepy', name: 'Sleepy Face', type: 'emoji', content: '😪' },
      { id: 'em-drooling', name: 'Drooling Face', type: 'emoji', content: '🤤' },
      { id: 'em-sleeping', name: 'Sleeping Face', type: 'emoji', content: '😴' },
      { id: 'em-mask', name: 'Medical Mask Face', type: 'emoji', content: '😷' },
      { id: 'em-thermometer', name: 'Face with Thermometer', type: 'emoji', content: '🤒' },
      { id: 'em-head-bandage', name: 'Face with Head-Bandage', type: 'emoji', content: '🤕' },
      { id: 'em-nauseated', name: 'Nauseated Face', type: 'emoji', content: '🤢' },
      { id: 'em-sneezing', name: 'Sneezing Face', type: 'emoji', content: '🤧' },
      { id: 'em-hot', name: 'Hot Face', type: 'emoji', content: '🥵' },
      { id: 'em-cold', name: 'Cold Face', type: 'emoji', content: '🥶' },
      { id: 'em-woozy', name: 'Woozy Face', type: 'emoji', content: '🥴' },
      { id: 'em-dizzy', name: 'Dizzy Face', type: 'emoji', content: '😵' },
      { id: 'em-exploding-head', name: 'Exploding Head Mind Blown', type: 'emoji', content: '🤯' },
      { id: 'em-cowboy', name: 'Cowboy Hat Face', type: 'emoji', content: '🤠' },
      { id: 'em-partying', name: 'Partying Face', type: 'emoji', content: '🥳' },
      { id: 'em-sunglasses', name: 'Smiling Face with Sunglasses', type: 'emoji', content: '😎' },
      { id: 'em-nerd', name: 'Nerd Face', type: 'emoji', content: '🤓' },
      { id: 'em-monocle', name: 'Face with Monocle', type: 'emoji', content: '🧐' },
      { id: 'em-confused', name: 'Confused Face', type: 'emoji', content: '😕' },
      { id: 'em-worried', name: 'Worried Face', type: 'emoji', content: '😟' },
      { id: 'em-pleading', name: 'Pleading Face', type: 'emoji', content: '🥺' },
      { id: 'em-cry', name: 'Crying Face', type: 'emoji', content: '😢' },
      { id: 'em-sob', name: 'Loudly Crying Face', type: 'emoji', content: '😭' },
      { id: 'em-scream', name: 'Face Screaming in Fear', type: 'emoji', content: '😱' },
      { id: 'em-rage', name: 'Enraged Face', type: 'emoji', content: '😡' },
      { id: 'em-thumbs-up', name: 'Thumbs Up Like', type: 'emoji', content: '👍' },
      { id: 'em-thumbs-down', name: 'Thumbs Down', type: 'emoji', content: '👎' },
      { id: 'em-clap', name: 'Clapping Hands', type: 'emoji', content: '👏' },
      { id: 'em-raised-hands', name: 'Raising Hands Celebrate', type: 'emoji', content: '🙌' },
      { id: 'em-open-hands', name: 'Open Hands', type: 'emoji', content: '👐' },
      { id: 'em-handshake', name: 'Handshake Deal', type: 'emoji', content: '🤝' },
      { id: 'em-fist', name: 'Fist Bump', type: 'emoji', content: '👊' },
      { id: 'em-peace', name: 'Peace Sign Victory', type: 'emoji', content: '✌️' },
      { id: 'em-crossed-fingers', name: 'Crossed Fingers Wish', type: 'emoji', content: '🤞' },
      { id: 'em-love-you', name: 'Love-You Gesture', type: 'emoji', content: '🤟' },
      { id: 'em-wave', name: 'Waving Hand Hello', type: 'emoji', content: '👋' },
      { id: 'em-point-up', name: 'Pointing Up Index', type: 'emoji', content: '☝️' },
      { id: 'em-point-right', name: 'Pointing Right', type: 'emoji', content: '👉' },
      { id: 'em-pray', name: 'Folded Hands Pray Thank You', type: 'emoji', content: '🙏' },
      { id: 'em-brain', name: 'Brain Intellect', type: 'emoji', content: '🧠' }
    ]
  },
  {
    id: 'nature',
    label: 'Animals & Nature',
    icon: '🌿',
    items: [
      { id: 'em-dog', name: 'Dog Puppy', type: 'emoji', content: '🐶' },
      { id: 'em-cat', name: 'Cat Kitten', type: 'emoji', content: '🐱' },
      { id: 'em-mouse', name: 'Mouse', type: 'emoji', content: '🐭' },
      { id: 'em-hamster', name: 'Hamster', type: 'emoji', content: '🐹' },
      { id: 'em-rabbit', name: 'Rabbit Bunny', type: 'emoji', content: '🐰' },
      { id: 'em-fox', name: 'Fox', type: 'emoji', content: '🦊' },
      { id: 'em-bear', name: 'Bear', type: 'emoji', content: '🐻' },
      { id: 'em-panda', name: 'Panda', type: 'emoji', content: '🐼' },
      { id: 'em-koala', name: 'Koala', type: 'emoji', content: '🐨' },
      { id: 'em-tiger', name: 'Tiger', type: 'emoji', content: '🐯' },
      { id: 'em-lion', name: 'Lion', type: 'emoji', content: '🦁' },
      { id: 'em-cow', name: 'Cow', type: 'emoji', content: '🐮' },
      { id: 'em-pig', name: 'Pig', type: 'emoji', content: '🐷' },
      { id: 'em-frog', name: 'Frog', type: 'emoji', content: '🐸' },
      { id: 'em-monkey', name: 'Monkey', type: 'emoji', content: '🐵' },
      { id: 'em-chicken', name: 'Chicken', type: 'emoji', content: '🐔' },
      { id: 'em-penguin', name: 'Penguin', type: 'emoji', content: '🐧' },
      { id: 'em-bird', name: 'Bird', type: 'emoji', content: '🐦' },
      { id: 'em-eagle', name: 'Eagle', type: 'emoji', content: '🦅' },
      { id: 'em-owl', name: 'Owl Tutor', type: 'emoji', content: '🦉' },
      { id: 'em-wolf', name: 'Wolf', type: 'emoji', content: '🐺' },
      { id: 'em-unicorn', name: 'Unicorn', type: 'emoji', content: '🦄' },
      { id: 'em-bee', name: 'Honeybee Busy', type: 'emoji', content: '🐝' },
      { id: 'em-butterfly', name: 'Butterfly', type: 'emoji', content: '🦋' },
      { id: 'em-octopus', name: 'Octopus Multitask', type: 'emoji', content: '🐙' },
      { id: 'em-dolphin', name: 'Dolphin', type: 'emoji', content: '🐬' },
      { id: 'em-whale', name: 'Whale', type: 'emoji', content: '🐳' },
      { id: 'em-turtle', name: 'Turtle Slow Steady', type: 'emoji', content: '🐢' },
      { id: 'em-evergreen', name: 'Evergreen Tree', type: 'emoji', content: '🌲' },
      { id: 'em-cactus', name: 'Cactus', type: 'emoji', content: '🌵' },
      { id: 'em-four-leaf', name: 'Four Leaf Clover Luck', type: 'emoji', content: '🍀' },
      { id: 'em-maple', name: 'Maple Leaf Autumn', type: 'emoji', content: '🍁' },
      { id: 'em-sunflower', name: 'Sunflower', type: 'emoji', content: '🌻' },
      { id: 'em-cherry-blossom', name: 'Cherry Blossom', type: 'emoji', content: '🌸' }
    ]
  },
  {
    id: 'food',
    label: 'Food & Drink',
    icon: '🍔',
    items: [
      { id: 'em-apple', name: 'Red Apple Study', type: 'emoji', content: '🍎' },
      { id: 'em-banana', name: 'Banana', type: 'emoji', content: '🍌' },
      { id: 'em-watermelon', name: 'Watermelon', type: 'emoji', content: '🍉' },
      { id: 'em-grapes', name: 'Grapes', type: 'emoji', content: '🍇' },
      { id: 'em-strawberry', name: 'Strawberry', type: 'emoji', content: '🍓' },
      { id: 'em-avocado', name: 'Avocado', type: 'emoji', content: '🥑' },
      { id: 'em-carrot', name: 'Carrot', type: 'emoji', content: '🥕' },
      { id: 'em-pizza', name: 'Pizza Slice', type: 'emoji', content: '🍕' },
      { id: 'em-burger', name: 'Hamburger', type: 'emoji', content: '🍔' },
      { id: 'em-fries', name: 'French Fries', type: 'emoji', content: '🍟' },
      { id: 'em-hotdog', name: 'Hot Dog', type: 'emoji', content: '🌭' },
      { id: 'em-sandwich', name: 'Sandwich', type: 'emoji', content: '🥪' },
      { id: 'em-taco', name: 'Taco', type: 'emoji', content: '🌮' },
      { id: 'em-ramen', name: 'Steaming Bowl Ramen', type: 'emoji', content: '🍜' },
      { id: 'em-sushi', name: 'Sushi', type: 'emoji', content: '🍣' },
      { id: 'em-icecream', name: 'Ice Cream Cone', type: 'emoji', content: '🍦' },
      { id: 'em-donut', name: 'Doughnut Donut', type: 'emoji', content: '🍩' },
      { id: 'em-cookie', name: 'Cookie Snack', type: 'emoji', content: '🍪' },
      { id: 'em-birthday-cake', name: 'Birthday Cake Party', type: 'emoji', content: '🎂' },
      { id: 'em-chocolate', name: 'Chocolate Bar', type: 'emoji', content: '🍫' },
      { id: 'em-coffee', name: 'Hot Coffee Focus', type: 'emoji', content: '☕' },
      { id: 'em-tea', name: 'Tea Cup', type: 'emoji', content: '🍵' },
      { id: 'em-boba', name: 'Bubble Tea Boba', type: 'emoji', content: '🧋' }
    ]
  },
  {
    id: 'activities',
    label: 'Activities & Sports',
    icon: '⚽',
    items: [
      { id: 'em-soccer', name: 'Soccer Ball Football', type: 'emoji', content: '⚽' },
      { id: 'em-basketball', name: 'Basketball', type: 'emoji', content: '🏀' },
      { id: 'em-baseball', name: 'Baseball', type: 'emoji', content: '⚾' },
      { id: 'em-tennis', name: 'Tennis', type: 'emoji', content: '🎾' },
      { id: 'em-trophy', name: 'Trophy Cup Winner 1st', type: 'emoji', content: '🏆' },
      { id: 'em-medal-1st', name: '1st Place Gold Medal', type: 'emoji', content: '🥇' },
      { id: 'em-medal-2nd', name: '2nd Place Silver Medal', type: 'emoji', content: '🥈' },
      { id: 'em-medal-3rd', name: '3rd Place Bronze Medal', type: 'emoji', content: '🥉' },
      { id: 'em-video-game', name: 'Video Gamepad Controller', type: 'emoji', content: '🎮' },
      { id: 'em-dice', name: 'Game Die Dice', type: 'emoji', content: '🎲' },
      { id: 'em-dart', name: 'Direct Hit Bullseye Dart', type: 'emoji', content: '🎯' },
      { id: 'em-art-palette', name: 'Artist Palette Painting', type: 'emoji', content: '🎨' },
      { id: 'em-music-notes', name: 'Musical Notes Melody', type: 'emoji', content: '🎶' },
      { id: 'em-guitar', name: 'Guitar Rock', type: 'emoji', content: '🎸' }
    ]
  },
  {
    id: 'travel',
    label: 'Travel & Places',
    icon: '🚌',
    items: [
      { id: 'em-rocket', name: 'Rocket Ship Launch', type: 'emoji', content: '🚀' },
      { id: 'em-airplane', name: 'Airplane Flight', type: 'emoji', content: '✈️' },
      { id: 'em-car', name: 'Automobile Car', type: 'emoji', content: '🚗' },
      { id: 'em-bus', name: 'Bus School', type: 'emoji', content: '🚌' },
      { id: 'em-train', name: 'High-Speed Train', type: 'emoji', content: '🚄' },
      { id: 'em-bike', name: 'Bicycle Bike', type: 'emoji', content: '🚲' },
      { id: 'em-school', name: 'School Building Academy', type: 'emoji', content: '🏫' },
      { id: 'em-classical-building', name: 'University Classical Building', type: 'emoji', content: '🏛️' },
      { id: 'em-hospital', name: 'Hospital', type: 'emoji', content: '🏥' },
      { id: 'em-mountain', name: 'Snow-Capped Mountain Summit', type: 'emoji', content: '🏔️' },
      { id: 'em-camping', name: 'Camping Tent', type: 'emoji', content: '🏕️' }
    ]
  },
  {
    id: 'objects',
    label: 'Objects & Tools',
    icon: '💡',
    items: [
      { id: 'em-lightbulb', name: 'Light Bulb Idea Eureka', type: 'emoji', content: '💡' },
      { id: 'em-books', name: 'Books Study Reading', type: 'emoji', content: '📚' },
      { id: 'em-notebook', name: 'Spiral Notebook Memo', type: 'emoji', content: '📓' },
      { id: 'em-pencil', name: 'Pencil Write Drawing', type: 'emoji', content: '✏️' },
      { id: 'em-laptop', name: 'Laptop Computer Code', type: 'emoji', content: '💻' },
      { id: 'em-desktop', name: 'Desktop Monitor Screen', type: 'emoji', content: '🖥️' },
      { id: 'em-phone', name: 'Mobile Phone Smartphone', type: 'emoji', content: '📱' },
      { id: 'em-clock', name: 'Alarm Clock Time Pomodoro', type: 'emoji', content: '⏰' },
      { id: 'em-hourglass', name: 'Hourglass Timer', type: 'emoji', content: '⏳' },
      { id: 'em-microscope', name: 'Microscope Science Lab', type: 'emoji', content: '🔬' },
      { id: 'em-telescope', name: 'Telescope Astronomy', type: 'emoji', content: '🔭' },
      { id: 'em-chart', name: 'Chart Increasing Trend Graph', type: 'emoji', content: '📈' },
      { id: 'em-memo', name: 'Memo Paper Note', type: 'emoji', content: '📝' },
      { id: 'em-clipboard', name: 'Clipboard Task List', type: 'emoji', content: '📋' },
      { id: 'em-calendar', name: 'Calendar Schedule Date', type: 'emoji', content: '📅' },
      { id: 'em-pin', name: 'Pushpin Red Pin', type: 'emoji', content: '📌' },
      { id: 'em-scissors', name: 'Scissors Cut', type: 'emoji', content: '✂️' },
      { id: 'em-magnifier', name: 'Magnifying Glass Search Inspect', type: 'emoji', content: '🔍' },
      { id: 'em-lock', name: 'Locked Padlock Security', type: 'emoji', content: '🔒' },
      { id: 'em-key', name: 'Key Access Solution', type: 'emoji', content: '🔑' },
      { id: 'em-gem', name: 'Gem Stone Diamond Value', type: 'emoji', content: '💎' }
    ]
  },
  {
    id: 'symbols',
    label: 'Symbols & Badges',
    icon: '💖',
    items: [
      { id: 'em-heart-red', name: 'Red Heart Love Favorite', type: 'emoji', content: '❤️' },
      { id: 'em-heart-orange', name: 'Orange Heart Brand Accent', type: 'emoji', content: '🧡' },
      { id: 'em-sparkles', name: 'Sparkles AI Magic', type: 'emoji', content: '✨' },
      { id: 'em-star-gold', name: 'Glowing Star Rating 10', type: 'emoji', content: '⭐' },
      { id: 'em-fire', name: 'Fire Flame Streak Hot', type: 'emoji', content: '🔥' },
      { id: 'em-100', name: 'Hundred Points Score 100', type: 'emoji', content: '💯' },
      { id: 'em-check-mark', name: 'Check Mark Done Correct', type: 'emoji', content: '✅' },
      { id: 'em-cross-mark', name: 'Cross Mark Wrong Error', type: 'emoji', content: '❌' },
      { id: 'em-question-mark', name: 'Red Question Mark Ask', type: 'emoji', content: '❓' },
      { id: 'em-exclamation', name: 'Exclamation Mark Notice Attention', type: 'emoji', content: '❗' },
      { id: 'em-warning', name: 'Warning Sign Caution', type: 'emoji', content: '⚠️' },
      { id: 'em-recycle', name: 'Recycling Symbol Refresh', type: 'emoji', content: '♻️' },
      { id: 'em-infinity', name: 'Infinity Endless Unlimited', type: 'emoji', content: '♾️' },
      { id: 'em-bell', name: 'Bell Notification Alert', type: 'emoji', content: '🔔' }
    ]
  },
  {
    id: 'flags',
    label: 'Flags',
    icon: '🚩',
    items: [
      { id: 'em-flag-vn', name: 'Vietnam Flag VN', type: 'emoji', content: '🇻🇳' },
      { id: 'em-flag-us', name: 'United States Flag USA', type: 'emoji', content: '🇺🇸' },
      { id: 'em-flag-uk', name: 'United Kingdom Flag UK', type: 'emoji', content: '🇬🇧' },
      { id: 'em-flag-jp', name: 'Japan Flag', type: 'emoji', content: '🇯🇵' },
      { id: 'em-flag-kr', name: 'South Korea Flag', type: 'emoji', content: '🇰🇷' },
      { id: 'em-flag-fr', name: 'France Flag', type: 'emoji', content: '🇫🇷' },
      { id: 'em-flag-de', name: 'Germany Flag', type: 'emoji', content: '🇩🇪' },
      { id: 'em-flag-ca', name: 'Canada Flag', type: 'emoji', content: '🇨🇦' },
      { id: 'em-flag-au', name: 'Australia Flag', type: 'emoji', content: '🇦🇺' },
      { id: 'em-flag-chequered', name: 'Chequered Finish Flag Victory', type: 'emoji', content: '🏁' },
      { id: 'em-flag-triangular', name: 'Triangular Red Flag Goal', type: 'emoji', content: '🚩' }
    ]
  }
];

// =========================================================================
// 2. MIRO-STYLE VECTOR STICKERS (Matching Image 2 exactly)
// =========================================================================
export const STICKER_CATEGORIES: StickerCategory[] = [
  {
    id: 'funky_lines',
    label: 'Funky Lines',
    icon: '❤️',
    items: [
      {
        id: 'st-funky-apple',
        name: 'Táo sâu chăm chỉ (Apple with Worm)',
        type: 'sticker',
        isSvg: true,
        width: 140,
        height: 140,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M50 24 C36 12 16 20 18 44 C20 68 40 82 50 84 C60 82 80 68 82 44 C84 20 64 12 50 24 Z" fill="#ff4d6d" stroke="#000" stroke-width="2.5"/><path d="M50 24 C50 14 56 10 60 8" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/><path d="M30 60 Q20 54 24 44 Q28 34 36 38 Q42 42 36 50" fill="#a7f3d0" stroke="#000" stroke-width="2.5"/><circle cx="28" cy="40" r="2" fill="#000"/><circle cx="38" cy="50" r="3" fill="#000"/><circle cx="62" cy="50" r="3" fill="#000"/><path d="M46 62 Q50 68 54 62" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/><path d="M38 82 L38 90 L32 92" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/><path d="M62 82 L62 90 L68 92" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/></svg>`
      },
      {
        id: 'st-funky-boombox',
        name: 'Đài Cassette Retro (Boombox)',
        type: 'sticker',
        isSvg: true,
        width: 160,
        height: 120,
        content: `<svg viewBox="0 0 100 80" width="100%" height="100%"><rect x="10" y="20" width="80" height="50" rx="8" fill="#a855f7" stroke="#000" stroke-width="2.5"/><path d="M30 20 L30 10 L70 10 L70 20" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/><line x1="80" y1="10" x2="90" y2="2" stroke="#000" stroke-width="2.5" stroke-linecap="round"/><rect x="42" y="32" width="38" height="28" rx="4" fill="#22c55e" stroke="#000" stroke-width="2.5"/><circle cx="26" cy="46" r="10" fill="#3b82f6" stroke="#000" stroke-width="2.5"/><circle cx="26" cy="46" r="4" fill="#000"/><circle cx="54" cy="46" r="2.5" fill="#000"/><circle cx="68" cy="46" r="2.5" fill="#000"/><path d="M58 54 Q61 58 64 54" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>`
      },
      {
        id: 'st-funky-ladybug',
        name: 'Bọ rùa mắt to (Ladybug)',
        type: 'sticker',
        isSvg: true,
        width: 150,
        height: 120,
        content: `<svg viewBox="0 0 100 80" width="100%" height="100%"><ellipse cx="50" cy="44" rx="36" ry="24" fill="#f43f5e" stroke="#000" stroke-width="2.5"/><circle cx="76" cy="44" r="14" fill="#fef08a" stroke="#000" stroke-width="2.5"/><circle cx="78" cy="42" r="2.5" fill="#000"/><path d="M74 50 Q78 54 82 50" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/><circle cx="30" cy="38" r="5" fill="#38bdf8" stroke="#000" stroke-width="2"/><circle cx="48" cy="34" r="4" fill="#38bdf8" stroke="#000" stroke-width="2"/><circle cx="40" cy="52" r="5" fill="#38bdf8" stroke="#000" stroke-width="2"/><path d="M26 68 L24 76" stroke="#000" stroke-width="3" stroke-linecap="round"/><path d="M46 68 L46 76" stroke="#000" stroke-width="3" stroke-linecap="round"/><path d="M66 68 L68 76" stroke="#000" stroke-width="3" stroke-linecap="round"/></svg>`
      },
      {
        id: 'st-funky-cap',
        name: 'Mũ lưỡi trai cá tính (Green Cap)',
        type: 'sticker',
        isSvg: true,
        width: 140,
        height: 130,
        content: `<svg viewBox="0 0 100 90" width="100%" height="100%"><path d="M22 65 C18 35 45 15 75 25 C85 45 80 65 75 65 Z" fill="#4ade80" stroke="#000" stroke-width="2.5"/><path d="M22 65 Q50 82 85 65 Q70 55 22 65 Z" fill="#3b82f6" stroke="#000" stroke-width="2.5"/><circle cx="40" cy="36" r="3" fill="#a855f7"/><circle cx="56" cy="30" r="3" fill="#a855f7"/><circle cx="68" cy="42" r="3" fill="#a855f7"/><ellipse cx="50" cy="52" rx="10" ry="7" fill="#f472b6" stroke="#000" stroke-width="1.8"/><circle cx="47" cy="50" r="1.5" fill="#000"/><circle cx="53" cy="50" r="1.5" fill="#000"/><path d="M48 54 Q50 56 52 54" fill="none" stroke="#000" stroke-width="1.5"/></svg>`
      },
      {
        id: 'st-funky-cat-box',
        name: 'Mèo chui hộp (Cat in Box)',
        type: 'sticker',
        isSvg: true,
        width: 140,
        height: 140,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="20" y="52" width="60" height="36" rx="4" fill="#fb7185" stroke="#000" stroke-width="2.5"/><ellipse cx="50" cy="46" rx="28" ry="22" fill="#818cf8" stroke="#000" stroke-width="2.5"/><polygon points="28 32 38 42 26 44" fill="#818cf8" stroke="#000" stroke-width="2"/><polygon points="72 32 62 42 74 44" fill="#818cf8" stroke="#000" stroke-width="2"/><circle cx="42" cy="46" r="2.5" fill="#000"/><circle cx="58" cy="46" r="2.5" fill="#000"/><path d="M48 50 Q50 54 52 50" fill="none" stroke="#000" stroke-width="2"/><path d="M30 88 L26 96" stroke="#000" stroke-width="3" stroke-linecap="round"/><path d="M70 88 L74 96" stroke="#000" stroke-width="3" stroke-linecap="round"/></svg>`
      },
      {
        id: 'st-funky-laptop',
        name: 'Laptop pixel vui nhộn (Happy Laptop)',
        type: 'sticker',
        isSvg: true,
        width: 140,
        height: 140,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="25" y="22" width="50" height="40" rx="4" fill="#38bdf8" stroke="#000" stroke-width="2.5"/><rect x="32" y="28" width="36" height="28" rx="2" fill="#fff" stroke="#000" stroke-width="2"/><rect x="40" y="36" width="3" height="3" fill="#000"/><rect x="56" y="36" width="3" height="3" fill="#000"/><path d="M42 46 h16" stroke="#000" stroke-width="2.5"/><polygon points="15 68 85 68 75 62 25 62" fill="#facc15" stroke="#000" stroke-width="2.5"/><path d="M35 68 L25 86 L35 88" fill="none" stroke="#f43f5e" stroke-width="4" stroke-linecap="round"/><path d="M65 68 L75 86 L85 88" fill="none" stroke="#f43f5e" stroke-width="4" stroke-linecap="round"/></svg>`
      },
      {
        id: 'st-funky-crystal-ball',
        name: 'Quả cầu pha lê (Crystal Ball)',
        type: 'sticker',
        isSvg: true,
        width: 130,
        height: 140,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="46" r="32" fill="#a7f3d0" stroke="#000" stroke-width="2.5"/><path d="M34 46 Q50 30 66 46 Q50 62 34 46 Z" fill="#fff" stroke="#000" stroke-width="2"/><circle cx="50" cy="46" r="5" fill="#a855f7"/><rect x="32" y="76" width="36" height="12" rx="4" fill="#818cf8" stroke="#000" stroke-width="2.5"/></svg>`
      },
      {
        id: 'st-funky-dumpster-fire',
        name: 'Thùng rác bốc lửa (Dumpster Fire)',
        type: 'sticker',
        isSvg: true,
        width: 150,
        height: 130,
        content: `<svg viewBox="0 0 100 90" width="100%" height="100%"><polygon points="30 40 40 18 50 32 60 12 70 38 80 24 75 42" fill="#f97316" stroke="#000" stroke-width="2.5"/><polygon points="38 40 45 26 52 35 58 22 68 40" fill="#facc15"/><rect x="20" y="40" width="60" height="38" rx="4" fill="#4ade80" stroke="#000" stroke-width="2.5"/><polygon points="12 40 22 28 80 40" fill="#22c55e" stroke="#000" stroke-width="2.5"/><circle cx="42" cy="56" r="3" fill="#000"/><circle cx="62" cy="56" r="3" fill="#000"/><ellipse cx="52" cy="66" rx="4" ry="5" fill="#000"/><circle cx="28" cy="82" r="4" fill="#000"/><circle cx="72" cy="82" r="4" fill="#000"/></svg>`
      },
      {
        id: 'st-funky-house',
        name: 'Ngôi nhà hoạt hình (Cartoon Cottage)',
        type: 'sticker',
        isSvg: true,
        width: 130,
        height: 140,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="50 14 84 40 16 40" fill="#818cf8" stroke="#000" stroke-width="2.5"/><rect x="22" y="40" width="56" height="48" fill="#f472b6" stroke="#000" stroke-width="2.5"/><rect x="42" y="58" width="18" height="30" fill="#fde047" stroke="#000" stroke-width="2"/><circle cx="46" cy="72" r="1.5" fill="#000"/><rect x="28" y="48" width="10" height="10" fill="#38bdf8" stroke="#000" stroke-width="2"/></svg>`
      },
      {
        id: 'st-funky-popsicle',
        name: 'Que kem siêu ngầu (Cool Popsicle)',
        type: 'sticker',
        isSvg: true,
        width: 120,
        height: 150,
        content: `<svg viewBox="0 0 100 110" width="100%" height="100%"><rect x="30" y="16" width="40" height="58" rx="20" fill="#4ade80" stroke="#000" stroke-width="2.5"/><rect x="44" y="74" width="12" height="26" rx="4" fill="#fed7aa" stroke="#000" stroke-width="2.5"/><ellipse cx="42" cy="40" rx="7" ry="5" fill="#c084fc" stroke="#000" stroke-width="2"/><ellipse cx="58" cy="40" rx="7" ry="5" fill="#c084fc" stroke="#000" stroke-width="2"/><line x1="49" y1="40" x2="51" y2="40" stroke="#000" stroke-width="2"/><path d="M46 54 Q50 58 54 54" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>`
      },
      {
        id: 'st-funky-pencil',
        name: 'Bút chì hạnh phúc (Happy Pencil)',
        type: 'sticker',
        isSvg: true,
        width: 130,
        height: 140,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%" transform="rotate(25 50 50)"><rect x="38" y="24" width="24" height="48" fill="#4ade80" stroke="#000" stroke-width="2.5"/><polygon points="38 72 62 72 50 92" fill="#fed7aa" stroke="#000" stroke-width="2.5"/><polygon points="46 86 54 86 50 92" fill="#000"/><rect x="38" y="10" width="24" height="14" rx="4" fill="#fb7185" stroke="#000" stroke-width="2.5"/><circle cx="45" cy="42" r="2.5" fill="#000"/><circle cx="55" cy="42" r="2.5" fill="#000"/><path d="M46 50 Q50 54 54 50" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>`
      },
      {
        id: 'st-funky-padlock',
        name: 'Ổ khóa bí mật (Secret Padlock)',
        type: 'sticker',
        isSvg: true,
        width: 140,
        height: 140,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M35 44 V30 A15 15 0 0 1 65 30 V44" fill="none" stroke="#facc15" stroke-width="5" stroke-linecap="round"/><rect x="25" y="44" width="50" height="42" rx="8" fill="#c084fc" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="62" r="8" fill="#4ade80" stroke="#000" stroke-width="2"/><polygon points="48 66 52 66 54 74 46 74" fill="#000"/><path d="M25 60 Q12 55 16 70" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/><path d="M75 60 Q88 55 84 70" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/></svg>`
      }
    ]
  },
  {
    id: 'work_study',
    label: 'Work & Study',
    icon: '🎒',
    items: [
      {
        id: 'st-study-target',
        name: 'Mục tiêu 100% (Target 100)',
        type: 'sticker',
        isSvg: true,
        width: 130,
        height: 130,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="42" fill="#fee2e2" stroke="#ef4444" stroke-width="3"/><circle cx="50" cy="50" r="28" fill="#fff" stroke="#ef4444" stroke-width="3"/><circle cx="50" cy="50" r="14" fill="#ef4444"/><polygon points="50 12 56 34 78 36 60 50 66 72 50 58 34 72 40 50 22 36 44 34" fill="#fbbf24" stroke="#000" stroke-width="1.5"/></svg>`
      },
      {
        id: 'st-study-idea',
        name: 'Ý tưởng sáng tạo (Idea Bulb)',
        type: 'sticker',
        isSvg: true,
        width: 130,
        height: 140,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M50 18 A24 24 0 0 0 32 54 L36 66 L64 66 L68 54 A24 24 0 0 0 50 18 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="3"/><line x1="40" y1="72" x2="60" y2="72" stroke="#ca8a04" stroke-width="3" stroke-linecap="round"/><line x1="44" y1="78" x2="56" y2="78" stroke="#ca8a04" stroke-width="3" stroke-linecap="round"/><line x1="50" y1="6" x2="50" y2="12" stroke="#eab308" stroke-width="3" stroke-linecap="round"/><line x1="22" y1="20" x2="28" y2="24" stroke="#eab308" stroke-width="3" stroke-linecap="round"/><line x1="78" y1="20" x2="72" y2="24" stroke="#eab308" stroke-width="3" stroke-linecap="round"/></svg>`
      },
      {
        id: 'st-study-books',
        name: 'Chồng sách tri thức (Book Stack)',
        type: 'sticker',
        isSvg: true,
        width: 140,
        height: 130,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="18" y="64" width="64" height="18" rx="4" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2.5"/><rect x="22" y="44" width="56" height="18" rx="4" fill="#10b981" stroke="#047857" stroke-width="2.5"/><rect x="26" y="24" width="48" height="18" rx="4" fill="#f97316" stroke="#c2410c" stroke-width="2.5"/><polygon points="70 28 80 28 75 38" fill="#fef08a"/></svg>`
      },
      {
        id: 'st-study-medal',
        name: 'Huy chương vàng (Gold Medal)',
        type: 'sticker',
        isSvg: true,
        width: 130,
        height: 140,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="36 12 50 42 32 42" fill="#3b82f6" stroke="#000" stroke-width="2"/><polygon points="64 12 50 42 68 42" fill="#ef4444" stroke="#000" stroke-width="2"/><circle cx="50" cy="62" r="26" fill="#facc15" stroke="#ca8a04" stroke-width="3"/><text x="50" y="70" font-size="24" font-weight="900" fill="#713f12" text-anchor="middle">1</text></svg>`
      }
    ]
  },
  {
    id: 'mood_reactions',
    label: 'Mood & Energy',
    icon: '🚀',
    items: [
      {
        id: 'st-mood-rocket',
        name: 'Tên lửa bứt phá (Rocket Launch)',
        type: 'sticker',
        isSvg: true,
        width: 140,
        height: 140,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="50 10 68 40 32 40" fill="#ef4444" stroke="#000" stroke-width="2.5"/><rect x="36" y="40" width="28" height="34" rx="4" fill="#f8fafc" stroke="#000" stroke-width="2.5"/><circle cx="50" cy="54" r="6" fill="#38bdf8" stroke="#000" stroke-width="2"/><polygon points="24 64 36 54 36 74" fill="#f97316" stroke="#000" stroke-width="2"/><polygon points="76 64 64 54 64 74" fill="#f97316" stroke="#000" stroke-width="2"/><polygon points="42 74 58 74 50 94" fill="#facc15" stroke="#f97316" stroke-width="2"/></svg>`
      },
      {
        id: 'st-mood-flame',
        name: 'Lửa chuỗi ngày (Streak Flame)',
        type: 'sticker',
        isSvg: true,
        width: 130,
        height: 140,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M50 10 C50 30 75 40 75 64 A25 25 0 0 1 25 64 C25 44 40 34 50 10 Z" fill="#E0562D" stroke="#9a3412" stroke-width="3"/><path d="M50 38 C50 50 64 56 64 68 A14 14 0 0 1 36 68 C36 56 45 50 50 38 Z" fill="#fef08a"/></svg>`
      },
      {
        id: 'st-mood-party',
        name: 'Pháo hoa tiệc tùng (Party Popper)',
        type: 'sticker',
        isSvg: true,
        width: 130,
        height: 130,
        content: `<svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="18 82 46 72 28 54" fill="#facc15" stroke="#000" stroke-width="2.5"/><circle cx="54" cy="38" r="4" fill="#ef4444"/><circle cx="72" cy="46" r="3.5" fill="#3b82f6"/><circle cx="48" cy="22" r="3" fill="#10b981"/><path d="M38 46 Q52 28 68 32" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round"/><path d="M46 60 Q66 50 82 64" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round"/></svg>`
      }
    ]
  }
];
