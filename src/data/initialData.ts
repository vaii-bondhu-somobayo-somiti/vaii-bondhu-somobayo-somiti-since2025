import { SocietyData, CommitteeMember } from '../types';

export const INITIAL_MEMBERS = [
  {
    id: "VB20250001",
    rollNo: 1,
    name: "রাজন শিকদার",
    phone: "01618629527",
    role: "সভাপতি",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "নিয়মিত চাঁদা পরিশোধিত"
  },
  {
    id: "VB20250002",
    rollNo: 2,
    name: "মো: রনি ইসলাম",
    phone: "98979162",
    role: "সদস্য",
    august: null,
    september: null,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "আগস্ট ও সেপ্টেম্বর বাকি রয়েছে"
  },
  {
    id: "VB20250003",
    rollNo: 3,
    name: "রিয়াদ হোসেন",
    phone: "01625563839",
    role: "সহকারী ক্যাশিয়ার",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "নিয়মিত চাঁদা পরিশোধিত"
  },
  {
    id: "VB20250004",
    rollNo: 4,
    name: "মমিন মাঝি",
    phone: "94477834",
    role: "উপদেষ্টা",
    august: null,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "আগস্ট বাকি, সেপ্টেম্বর পরিশোধিত"
  },
  {
    id: "VB20250005",
    rollNo: 5,
    name: "হাসান মাঝি",
    phone: "01880980716",
    role: "ক্যাশিয়ার",
    august: 2500,
    september: null,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "আগস্ট পরিশোধিত, সেপ্টেম্বর জমা বাকি"
  },
  {
    id: "VB20250006",
    rollNo: 6,
    name: "সজল শিকদার",
    phone: "01608421757",
    role: "সহ-সভাপতি",
    august: 2500,
    september: null,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "আগস্ট পরিশোধিত, সেপ্টেম্বর বাকি"
  },
  {
    id: "VB20250007",
    rollNo: 7,
    name: "মো: রাকিব",
    phone: "01648440277",
    role: "সহ-সভাপতি",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "নিয়মিত চাঁদা পরিশোধিত"
  },
  {
    id: "VB20250008",
    rollNo: 8,
    name: "রিদয় (ভাগিনা)",
    phone: "+966594578068",
    role: "উপদেষ্টা",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "সৌদি আরব প্রবাসী সদস্য"
  },
  {
    id: "VB20250009",
    rollNo: 9,
    name: "ইলিয়াস",
    phone: "0560527692",
    role: "উপদেষ্টা",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "নিয়মিত চাঁদা পরিশোধিত"
  },
  {
    id: "VB20250010",
    rollNo: 10,
    name: "শান্ত শিকদার",
    phone: "01955179231",
    role: "যুগ্ম সাধারণ সম্পাদক",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "নিয়মিত চাঁদা পরিশোধিত"
  },
  {
    id: "VB20250011",
    rollNo: 11,
    name: "সবুজ (ভাগিনা)",
    phone: "+966558584972",
    role: "উপদেষ্টা",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "সৌদি প্রবাসী সদস্য"
  },
  {
    id: "VB20250012",
    rollNo: 12,
    name: "আব্দুল কাইয়ুম",
    phone: "+966511032821",
    role: "সদস্য",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "নিয়মিত চাঁদা পরিশোধিত"
  },
  {
    id: "VB20250013",
    rollNo: 13,
    name: "সাইফুল (ভাগিনা)",
    phone: "+60179262294",
    role: "সদস্য",
    august: 2500,
    september: null,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "মালয়েশিয়া প্রবাসী সদস্য, সেপ্টেম্বর জমা বাকি"
  },
  {
    id: "VB20250014",
    rollNo: 14,
    name: "পারভেজ খান",
    phone: "+601161597275",
    role: "উপদেষ্টা",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "মালয়েশিয়া প্রবাসী সদস্য"
  },
  {
    id: "VB20250015",
    rollNo: 15,
    name: "বুলবুল আহমেদ",
    phone: "0511082867",
    role: "সদস্য",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "নিয়মিত চাঁদা পরিশোধিত"
  },
  {
    id: "VB20250016",
    rollNo: 16,
    name: "মো: উজ্জ্বল",
    phone: "01687798607",
    role: "সাধারণ সম্পাদক",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "নিয়মিত চাঁদা পরিশোধিত"
  },
  {
    id: "VB20250017",
    rollNo: 17,
    name: "সওকত খান",
    phone: "+966575014199",
    role: "সদস্য",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "প্রবাসী সদস্য"
  },
  {
    id: "VB20250018",
    rollNo: 18,
    name: "মিরাজ খান",
    phone: "+966571832410",
    role: "সদস্য",
    august: 3000,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "আগস্টে ৩০০০ টাকা অগ্রিম জমা দিয়েছেন"
  },
  {
    id: "VB20250019",
    rollNo: 19,
    name: "নিরব খান",
    phone: "01878533847",
    role: "সদস্য",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "নিয়মিত চাঁদা পরিশোধিত"
  },
  {
    id: "VB20250020",
    rollNo: 20,
    name: "খবির হোসেন",
    phone: "01878533847",
    role: "উপদেষ্টা",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "সম্মানিত উপদেষ্টা"
  },
  {
    id: "VB20250021",
    rollNo: 21,
    name: "ইয়ামিন",
    phone: "01878533847",
    role: "সদস্য",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "নিয়মিত চাঁদা পরিশোধিত"
  },
  {
    id: "VB20250022",
    rollNo: 22,
    name: "আরাফাত",
    phone: "01878533847",
    role: "সদস্য",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "নিয়মিত চাঁদা পরিশোধিত"
  },
  {
    id: "VB20250023",
    rollNo: 23,
    name: "হাছান শিকদার ১",
    phone: "+60176709821",
    role: "উপদেষ্টা",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "মালয়েশিয়া প্রবাসী সদস্য"
  },
  {
    id: "VB20250024",
    rollNo: 24,
    name: "হাছান শিকদার ২",
    phone: "+60176709821",
    role: "সদস্য",
    august: 2500,
    september: 2500,
    october: null,
    fine: 0,
    downPayment: 0,
    joinedDate: "২০২৫-০৮-০১",
    notes: "নিয়মিত চাঁদা পরিশোধিত"
  }
];

export const COMMITTEE_MEMBERS: CommitteeMember[] = [
  {
    id: "comm-1",
    role: "সভাপতি",
    name: "রাজন শিকদার",
    phone: "01618629527",
    badge: "প্রধান নির্বাহী",
    type: "executive"
  },
  {
    id: "comm-2",
    role: "সহ-সভাপতি",
    name: "মোঃ রাকিব",
    phone: "01648440277",
    badge: "কার্যনির্বাহী",
    type: "executive"
  },
  {
    id: "comm-3",
    role: "সহ-সভাপতি",
    name: "মোঃ সজল শিকদার",
    phone: "01608421757",
    badge: "কার্যনির্বাহী",
    type: "executive"
  },
  {
    id: "comm-4",
    role: "সাধারণ সম্পাদক",
    name: "উজ্জ্বল হোসেন",
    phone: "01687798607",
    badge: "প্রশাসনিক প্রধান",
    type: "executive"
  },
  {
    id: "comm-5",
    role: "যুগ্ম সাধারণ সম্পাদক",
    name: "মোঃ রনি মাঝি",
    phone: "98979162",
    badge: "সহযোগী পরিচালক",
    type: "joint"
  },
  {
    id: "comm-6",
    role: "যুগ্ম সাধারণ সম্পাদক",
    name: "শান্ত শিকদার",
    phone: "01955179231",
    badge: "সহযোগী পরিচালক",
    type: "joint"
  },
  {
    id: "comm-7",
    role: "ক্যাশিয়ার",
    name: "হাছান মাঝি",
    phone: "01880980716",
    badge: "অর্থ সম্পাদক",
    type: "cashier"
  },
  {
    id: "comm-8",
    role: "সহকারী ক্যাশিয়ার",
    name: "মোঃ রিয়াদ",
    phone: "01625563839",
    badge: "সহকারী অর্থ সম্পাদক",
    type: "cashier"
  },
  // সম্মানিত উপদেষ্টা মন্ডলী
  {
    id: "comm-9",
    role: "সম্মানিত উপদেষ্টা",
    name: "হাছান শিকদার",
    phone: "+60176709821",
    badge: "উপদেষ্টা মণ্ডলী",
    type: "advisor"
  },
  {
    id: "comm-10",
    role: "সম্মানিত উপদেষ্টা",
    name: "মমিন মাঝি",
    phone: "94477834",
    badge: "উপদেষ্টা মণ্ডলী",
    type: "advisor"
  },
  {
    id: "comm-11",
    role: "সম্মানিত উপদেষ্টা",
    name: "মোঃ সবুজ (ভাগিনা)",
    phone: "+966558584972",
    badge: "উপদেষ্টা মণ্ডলী",
    type: "advisor"
  },
  {
    id: "comm-12",
    role: "সম্মানিত উপদেষ্টা",
    name: "মোঃ পারভেজ",
    phone: "+601161597275",
    badge: "উপদেষ্টা মণ্ডলী",
    type: "advisor"
  },
  {
    id: "comm-13",
    role: "সম্মানিত উপদেষ্টা",
    name: "মোঃ ইলিয়াস",
    phone: "0560527692",
    badge: "উপদেষ্টা মণ্ডলী",
    type: "advisor"
  },
  {
    id: "comm-14",
    role: "সম্মানিত উপদেষ্টা",
    name: "মোঃ হৃদয় (ভাগিনা)",
    phone: "+966594578068",
    badge: "উপদেষ্টা মণ্ডলী",
    type: "advisor"
  },
  {
    id: "comm-15",
    role: "সম্মানিত উপদেষ্টা",
    name: "মোঃ খবির",
    phone: "01878533847",
    badge: "উপদেষ্টা মণ্ডলী",
    type: "advisor"
  }
];

export const SOCIETY_RULES = [
  {
    no: 1,
    title: "সমিতির মেয়াদকাল",
    description: "সমিতির মেয়াদকাল ৫ বছর।",
    highlight: "মেয়াদকাল ৫ বছর"
  },
  {
    no: 2,
    title: "মাসিক চাঁদার পরিমাণ",
    description: "আমাদের মাসিক চাঁদা দুই হাজার টাকা করে।",
    highlight: "মাসিক চাঁদা ২,০০০ টাকা (বর্তমান সঞ্চয়সহ ২,৫০০ টাকা)"
  },
  {
    no: 3,
    title: "চাঁদা জমার সময়সীমা",
    description: "প্রতি মাসের ১৫ তারিখের মধ্যে চাঁদার টাকা জমা দিতে হবে। যদি কেউ জমা দিতে না পারে,,তাহলে কমিটি যে সিদ্ধান্ত নিবে তা মেনে নিতে হবে।",
    highlight: "প্রতি মাসের ১৫ তারিখের মধ্যে প্রদান বাধ্যতামূলক"
  },
  {
    no: 4,
    title: "মেয়াদপূর্তির পূর্বে প্রত্যাহার নীতি",
    description: "মেয়াদকাল শেষ হবার আগে যদি কেউ সমিতি চালাতে না পারে/চালাতে না চায় তাহলে তার মূল টাকা প্রফিট ছাড়া বছর শেষে দেওয়া হবে।",
    highlight: "প্রফিট ছাড়া বছর শেষে মূল টাকা ফেরত"
  },
  {
    no: 5,
    title: "অর্ধবার্ষিক ডাউন পেমেন্ট",
    description: "প্রতি বছরে ৬ মাস পর পর দুইবার করে সর্বনিম্ন (৫) হাজার টাকা ডাউন পেমেন্ট করতে হবে।(প্রয়োজনে পেমেন্ট বেশি পরিমান হতে পারে)।",
    highlight: "প্রতি ৬ মাসে সর্বনিম্ন ৫,০০০ টাকা ডাউন পেমেন্ট"
  },
  {
    no: 6,
    title: "ধার / ঋণ প্রদানের নিষেধাজ্ঞা",
    description: "সমিতির মূল টাকার থেকে কখনও কাউরে কোনো প্রকার ধার হিসাবে কোনো টাকা দেওয়া হবে না।",
    highlight: "কোনো প্রকার ব্যক্তিগত ধার দেওয়া সম্পূর্ণ নিষিদ্ধ"
  },
  {
    no: 7,
    title: "ব্যাংক জমা ও রসিদ প্রমাণ",
    description: "প্রতি মাসের ১৫ তারিখের মধ্যে যত টাকা উঠবে তা ঐ মাসের মধ্যেই ব্যাংকে জমা দিয় গ্রুপে রিসিট দেখাতে হবে।",
    highlight: "ঐ মাসের মধ্যেই ব্যাংকে জমা এবং গ্রুপে রিসিট প্রদর্শন"
  },
  {
    no: 8,
    title: "হিসাবের স্বচ্ছতা ও জবাবদিহিতা",
    description: "দায়িত্বব্রত কর্মকর্তাদের কাছ থেকে যে কোনো সদস্য হিসাবের বেপারে জানতে চাইলে তা দিতে বাধ্য থাকবে।",
    highlight: "যে কোনো সদস্যকে হিসাব দিতে কর্মকর্তারা বাধ্য থাকবেন"
  },
  {
    no: 9,
    title: "মেয়াদান্তে সমান বণ্টন",
    description: "সদস্যদের জমাকৃত অর্থ এবং সমিতির আয়-ব্যয় এর অংশ সমিতির মেয়াদ শেষে সকল সদস্যদের মাঝে সমান হারে বন্টন করা হবে।",
    highlight: "সকল সদস্যদের মাঝে সমান হারে মুনাফা ও অর্থ বণ্টন"
  },
  {
    no: 10,
    title: "লাভজনক খাতে তহবিল বিনিয়োগ",
    description: "সমিতির নির্দিষ্ট ফান্ড হয়ে গেলে,,সেই ফান্ড নিষ্ক্রিয় না রেখে বৈধ কোনো লাভজনক খাতে বিনিয়োগ করা হবে। এবং লাভ-লস সম্পূর্ণ টাকা রিজার্ভ ফান্ডে জমা হবে।",
    highlight: "বৈধ ব্যবসায়িক বিনিয়োগ এবং লাভ-লস রিজার্ভ ফান্ডে জমা"
  }
];

export const INITIAL_SOCIETY_DATA: SocietyData = {
  societyName: "ভাই-বন্ধু সমবায় সমিতি",
  tagline: "একতা সাথে থাকি, উন্নতির পথে",
  motto: "সমবায়ে শক্তি সবার জন্য সমৃদ্ধি • সমবায়ে গড়ি, সমৃদ্ধ ভবিষ্যৎ",
  establishedYear: "২০২৫",
  address: "মধ্য মুক্তির কান্দি, পাঠান বাজার, মতলব উত্তর, চাঁদপুর | ২০২৫",
  bankAccount: {
    bankName: "পূবালী ব্যাংক পিএলসি",
    accountName: "ভাই-বন্ধু সমবায় সমিতি",
    accountNumber: "3489101089241",
    branch: "ছেঙ্গারচর বাজার শাখা, মতলব উত্তর, চাঁদপুর",
    routingNumber: "175130452"
  },
  bkashNumbers: [
    {
      name: "হাছান মাঝি",
      role: "ক্যাশিয়ার",
      number: "01880980716",
      type: "পার্সোনাল / বিকাশ"
    },
    {
      name: "মোঃ রিয়াদ",
      role: "সহকারী ক্যাশিয়ার",
      number: "01625563839",
      type: "পার্সোনাল / বিকাশ"
    }
  ],
  nagadNumbers: [
    {
      name: "হাছান মাঝি",
      role: "ক্যাশিয়ার",
      number: "01880980716",
      type: "পার্সোনাল / নগদ"
    }
  ],
  currentBankBalance: 105500, // August 55,500 + September 50,000 = 105,500
  cashInHand: 0,
  monthlyFeeDefault: 2500,
  lastUpdated: new Date().toISOString(),
  members: INITIAL_MEMBERS,
  expenses: [
    {
      id: "exp-1",
      title: "রেজিস্ট্রেশন খাতা ও স্টেশনারি ক্রয়",
      amount: 650,
      date: "২০২৫-০৮-০৫",
      category: "স্টেশনারি",
      recordedBy: "হাছান মাঝি"
    },
    {
      id: "exp-2",
      title: "সমিতি ব্যানার ও সিল মোহর প্রস্তুত",
      amount: 1200,
      date: "২০২৫-০৮-১০",
      category: "প্রচার ও সরঞ্জাম",
      recordedBy: "উজ্জ্বল হোসেন"
    }
  ],
  paymentSubmissions: [],
  notices: [
    {
      id: "not-1",
      title: "সেপ্টেম্বর মাসের চাঁদা জমার শেষ তারিখ ১৫ তারিখ",
      date: "২০২৫-০৯-০৫",
      content: "সকল সম্মানিত সদস্যকে জানানো যাচ্ছে যে, সেপ্টেম্বর মাসের চাঁদা আগামী ১৫ তারিখের মধ্যে ক্যাশিয়ারের কাছে অথবা ব্যাংক অ্যাকাউন্টে জমা দেওয়ার জন্য অনুরোধ করা যাচ্ছে।",
      priority: "urgent"
    },
    {
      id: "not-2",
      title: "সমিতির মাসিক সাধারণ সভা ও হিসাব পর্যালোচনা",
      date: "২০২৫-০৯-২০",
      content: "আগামী মাসের প্রথম শুক্রবার পাঠান বাজার কার্যালয়ে সমিতির ত্রৈমাসিক পর্যালোচনা সভা অনুষ্ঠিত হবে। সকল সদস্যের উপস্থিতি বাধ্যতামূলক।",
      priority: "normal"
    }
  ],
  rules: SOCIETY_RULES,
  committee: COMMITTEE_MEMBERS,
  months2026: ['01', '02', '03'],
  adminSecurity: {
    username: 'admin',
    password: 'vaiibondhu113'
  }
};
