/* 90-Day Recomp Tracker
   Edit this file to change the plan. The app reads these values as-is.
   Month in START is 0-based: 8 means September.
*/

// First day of the plan, and how many days it runs.
const START = new Date(2026, 8, 26);
const DAYS = 90;

// Dates the gym is closed, besides every Sunday. Key is YYYY-MM-DD.
const HOLIDAYS = {
  '2026-10-02':'Gandhi Jayanti',
  '2026-10-20':'Dasara / Vijayadashami',
  '2026-11-08':'Diwali Amavasya / Lakshmi Pujan',
  '2026-11-10':'Diwali / Bali Pratipada',
  '2026-11-24':'Guru Nanak Jayanti'
};

// Gym sessions. The app rotates push, pull, legs on open days.
const WORKOUTS = {
  push:{
    title:'Push',
    focus:'Upper chest, shoulders, and triceps',
    cardio:'15–20 min easy or moderate incline treadmill walk',
    exercises:[
      {name:'Incline Dumbbell Press', sets:3, reps:'8–12', rest:'90 sec'},
      {name:'Machine Chest Press', sets:3, reps:'8–12', rest:'90 sec'},
      {name:'Cable/Dumbbell Lateral Raise', sets:3, reps:'12–20', rest:'60 sec'},
      {name:'Cable Fly', sets:2, reps:'12–15', rest:'60 sec'},
      {name:'Rope Triceps Pushdown', sets:3, reps:'10–15', rest:'60 sec'},
      {name:'Single-Arm Cable Triceps Extension', sets:2, reps:'10–15', rest:'60 sec'}
    ]
  },
  pull:{
    title:'Pull',
    focus:'Lats, upper back, rear delts, and biceps',
    cardio:'12–15 min easy cycling or incline walk',
    exercises:[
      {name:'Lat Pulldown', sets:3, reps:'8–12', rest:'90 sec'},
      {name:'Chest-Supported Dumbbell Row', sets:3, reps:'8–12', rest:'90 sec'},
      {name:'Seated Cable Row', sets:2, reps:'10–12', rest:'90 sec'},
      {name:'Cable Rear-Delt Fly', sets:3, reps:'12–20', rest:'60 sec'},
      {name:'Face Pull', sets:2, reps:'12–20', rest:'60 sec'},
      {name:'Dumbbell Curl', sets:3, reps:'10–15', rest:'60 sec'},
      {name:'Hammer Curl', sets:2, reps:'10–15', rest:'60 sec'}
    ]
  },
  legs:{
    title:'Legs',
    focus:'Quads, hamstrings, glutes, calves, and core',
    cardio:'10–15 min easy cycling or walking',
    exercises:[
      {name:'Leg Press', sets:3, reps:'8–12', rest:'120 sec'},
      {name:'Romanian Deadlift', sets:3, reps:'8–12', rest:'120 sec'},
      {name:'Bulgarian Split Squat', sets:2, reps:'8–12', rest:'90 sec'},
      {name:'Seated/Lying Leg Curl', sets:3, reps:'10–15', rest:'75 sec'},
      {name:'Leg Extension', sets:2, reps:'12–15', rest:'60 sec'},
      {name:'Standing Calf Raise', sets:3, reps:'12–20', rest:'60 sec'},
      {name:'Cable Crunch', sets:3, reps:'10–15', rest:'60 sec'}
    ]
  }
};

// Warm-up before the lifts, and stretching after. Keys match WORKOUTS.
const PREP = {
  push:{
    warmup:[
      {name:'Easy treadmill walk', how:'3 minutes, easy pace'},
      {name:'Arm circles', how:'10 forward and 10 backward, small and comfortable'},
      {name:'Thoracic rotations', how:'8 each side, comfortable range only'},
      {name:'Wall slides', how:'10 slow reps. Stop if the shoulder pinches or feels unstable'},
      {name:'Scapular push-ups', how:'10 reps, shoulders only, no painful range'},
      {name:'Very light chest press', how:'12 easy reps, very light'}
    ],
    stretch:[
      {name:'Doorway chest stretch', how:'Hold 20–30 sec each side, comfortable range only'},
      {name:'Cross-body shoulder stretch', how:'Hold 20–30 sec each side, gentle'},
      {name:'Lat stretch', how:'Hold 20–30 sec each side. Stop if the shoulder feels unstable'},
      {name:'Triceps stretch', how:'Hold 20–30 sec each side, comfortable range only'},
      {name:'Child’s pose', how:'Hold 30–45 sec and breathe'}
    ]
  },
  pull:{
    warmup:[
      {name:'Easy treadmill walk', how:'3 minutes, easy pace'},
      {name:'Arm circles', how:'10 each direction, small and comfortable'},
      {name:'Thoracic rotations', how:'8 each side, comfortable range only'},
      {name:'Band pull-apart', how:'15 slow reps'},
      {name:'Scapular pulldown', how:'10 reps, shoulder blades only'},
      {name:'Very light lat pulldown', how:'12 easy reps, very light'}
    ],
    stretch:[
      {name:'Lat stretch', how:'Hold 20–30 sec each side, comfortable range only'},
      {name:'Upper-back stretch', how:'Hold 20–30 sec'},
      {name:'Biceps wall stretch', how:'Hold 20–30 sec each side, gentle'},
      {name:'Rear-delt stretch', how:'Hold 20–30 sec each side. Stop if the shoulder feels unstable'},
      {name:'Child’s pose', how:'Hold 30–45 sec and breathe'}
    ]
  },
  legs:{
    warmup:[
      {name:'Easy bike', how:'3 minutes, easy pace'},
      {name:'Leg swings', how:'10 each leg, front to back'},
      {name:'Hip circles', how:'8 each direction'},
      {name:'Bodyweight squat', how:'10 slow reps'},
      {name:'Reverse lunge', how:'6 each leg, easy range'},
      {name:'Glute bridge', how:'12 reps'},
      {name:'Light leg press', how:'10 easy reps, very light'}
    ],
    stretch:[
      {name:'Standing quad stretch', how:'Hold 20–30 sec each side'},
      {name:'Hamstring stretch', how:'Hold 20–30 sec each side'},
      {name:'Hip flexor stretch', how:'Hold 20–30 sec each side'},
      {name:'Calf stretch', how:'Hold 20–30 sec each side'},
      {name:'Figure-4 glute stretch', how:'Hold 20–30 sec each side'}
    ]
  }
};
// Easy recovery on Sundays and holidays. Not a hard workout.
const REST_MOBILITY = [
  {name:'Easy walk', how:'30–45 minutes, easy pace'},
  {name:'Deep squat hold', how:'Hold 20–30 sec, heels down only if it is comfortable'},
  {name:'90/90 hip switches', how:'8–10 each side, slow'},
  {name:'World’s Greatest Stretch', how:'5 each side, easy range'},
  {name:'Thoracic rotations', how:'8 each side, comfortable range only'},
  {name:'Hip flexor stretch', how:'Hold 30 sec each side'},
  {name:'Hamstring stretch', how:'Hold 30 sec each side'},
  {name:'Calf stretch', how:'Hold 30 sec each side'},
  {name:'Chest opener', how:'Hold 30 sec, comfortable range. Stop if the shoulder feels unstable'},
  {name:'Child’s pose', how:'Hold 45–60 sec and breathe'}
];

// Day ranges are 0-based. 0–30 is days 1–30, and so on.
const PHASES = [
  {name:'Foundation', from:0, to:30, text:'Learn each lift and leave about 2 reps in reserve. The card uses the base sets and reps.'},
  {name:'Progression', from:30, to:60, text:'Lifts written as 3×8–12 move to 8–10. A lift written as 2×8–12 moves to 3×8–10. Add weight only when the top of the range is clean.'},
  {name:'Intensification', from:60, to:90, text:'The 3×8–12 lifts move to 6–10. Accessory work stays the same. Keep the reps strict and add the smallest weight only when the form stays clean.'}
];

// Per-gram values: kcal, protein (p), fiber (f).
const FOOD = {
  oats:{kcal:3.79,p:0.135,f:0.105},
  milk:{kcal:0.34,p:0.034,f:0},
  peanut:{kcal:5.67,p:0.258,f:0.085},
  besan:{kcal:3.87,p:0.222,f:0.108},
  moong:{kcal:3.47,p:0.245,f:0.082},
  masoor:{kcal:3.46,p:0.251,f:0.104},
  matki:{kcal:3.43,p:0.236,f:0.145},
  chawli:{kcal:3.23,p:0.238,f:0.100},
  chana:{kcal:3.60,p:0.190,f:0.170},
  jowar:{kcal:3.34,p:0.104,f:0.097},
  bajra:{kcal:3.61,p:0.116,f:0.112},
  nachni:{kcal:3.21,p:0.072,f:0.112}, // ragi flour: about 321 kcal, 7.2 g protein, 11.2 g fibre per 100 g
  veg:{kcal:0.25,p:0.012,f:0.020},
  oil:{kcal:9,p:0,f:0},
  dahi:{kcal:0.44,p:0.043,f:0},
  paneer:{kcal:2.65,p:0.18,f:0},
  soya:{kcal:3.45,p:0.52,f:0.13},
  sprout:{kcal:0.30,p:0.030,f:0.016},
  taak:{kcal:0.15,p:0.008,f:0}
};
// Seven meal days. The app repeats them in order.
const MENUS = [
  {
    name:'Besan chilla', short:'Chilla',
    meals:[
      {id:'breakfast', title:'Breakfast', dish:'Besan chilla and milk', items:[
        {id:'besan', g:85, label:'besan, two chillas'},
        {id:'veg', g:70, label:'onion, tomato, coriander, and green chilli'},
        {id:'oil', g:2, label:'oil'},
        {id:'milk', g:450, label:'skimmed milk'}
      ]},
      {id:'lunch', title:'Lunch', dish:'Jowar bhakri, moong pithla, and koshimbir', items:[
        {id:'jowar', g:50, label:'jowar flour, one bhakri'},
        {id:'moong', g:95, label:'dry moong, cooked as pithla'},
        {id:'veg', g:120, label:'palak, methi, or cabbage bhaji'},
        {id:'veg', g:80, label:'cucumber and tomato koshimbir'},
        {id:'dahi', g:200, label:'low-fat dahi'},
        {id:'oil', g:2, label:'oil'}
      ]},
      {id:'dinner', title:'Dinner', dish:'Masoor amti and milk', items:[
        {id:'masoor', g:95, label:'dry masoor, cooked as amti'},
        {id:'veg', g:150, label:'a simple cooked vegetable'},
        {id:'milk', g:500, label:'skimmed milk'},
        {id:'oil', g:2, label:'oil'}
      ]}
    ]
  },
  {
    name:'Oats and matki', short:'Oats',
    meals:[
      {id:'breakfast', title:'Breakfast', dish:'Oats, milk, and peanuts', items:[
        {id:'oats', g:45, label:'rolled oats, cooked in some of the milk'},
        {id:'milk', g:450, label:'skimmed milk'},
        {id:'peanut', g:8, label:'roasted peanuts, crushed'}
      ]},
      {id:'lunch', title:'Lunch', dish:'Jowar bhakri, matki usal, and zunka', items:[
        {id:'jowar', g:50, label:'jowar flour, one bhakri'},
        {id:'matki', g:90, label:'dry matki, cooked as usal'},
        {id:'besan', g:60, label:'besan, cooked as zunka'},
        {id:'veg', g:120, label:'cabbage, dodka, or pumpkin bhaji'},
        {id:'dahi', g:200, label:'low-fat dahi'},
        {id:'oil', g:2, label:'oil, for the usal'},
        {id:'oil', g:2, label:'oil, for the zunka'}
      ]},
      {id:'dinner', title:'Dinner', dish:'Moong amti and milk', items:[
        {id:'moong', g:95, label:'dry moong, cooked as amti'},
        {id:'veg', g:150, label:'a simple cooked vegetable'},
        {id:'milk', g:500, label:'skimmed milk'},
        {id:'oil', g:2, label:'oil'}
      ]}
    ]
  },
  {
    name:'Paneer lunch', short:'Paneer',
    meals:[
      {id:'breakfast', title:'Breakfast', dish:'Moong-besan chilla and milk', items:[
        {id:'besan', g:65, label:'besan, for the chillas'},
        {id:'moong', g:50, label:'dry moong, soaked and ground into the chillas'},
        {id:'veg', g:70, label:'onion, tomato, coriander, and green chilli'},
        {id:'oil', g:2, label:'oil'},
        {id:'milk', g:450, label:'skimmed milk'}
      ]},
      {id:'lunch', title:'Lunch', dish:'Bajra bhakri and paneer bhurji', note:'This is the only paneer meal in the 7-day cycle.', items:[
        {id:'bajra', g:50, label:'bajri flour, one bhakri'},
        {id:'paneer', g:80, label:'paneer, as bhurji or palak paneer'},
        {id:'veg', g:140, label:'palak or another simple bhaji'},
        {id:'veg', g:80, label:'cucumber and tomato koshimbir'},
        {id:'dahi', g:200, label:'low-fat dahi'},
        {id:'oil', g:2, label:'oil'}
      ]},
      
      {id:'dinner', title:'Dinner', dish:'Chawli usal and milk', items:[
        {id:'chawli', g:95, label:'dry chawli, cooked as usal'},
        {id:'veg', g:150, label:'a simple cooked vegetable'},
        {id:'milk', g:500, label:'skimmed milk'},
        {id:'oil', g:2, label:'oil'}
      ]}
    ]
  },
  {
    name:'Vegetable oats', short:'Amti',
    meals:[
      {id:'breakfast', title:'Breakfast', dish:'Vegetable oats and milk', items:[
        {id:'oats', g:50, label:'rolled oats, cooked with the vegetables'},
        {id:'veg', g:60, label:'onion, tomato, and cabbage'},
        {id:'oil', g:2, label:'oil'},
        {id:'milk', g:450, label:'skimmed milk'}
      ]},
      {id:'lunch', title:'Lunch', dish:'Jowar bhakri, masoor amti, and zunka', items:[
        {id:'jowar', g:50, label:'jowar flour, one bhakri'},
        {id:'masoor', g:100, label:'dry masoor, cooked as amti'},
        {id:'besan', g:55, label:'besan, cooked as zunka'},
        {id:'veg', g:100, label:'methi, palak, or another leafy bhaji'},
        {id:'dahi', g:200, label:'low-fat dahi'},
        {id:'oil', g:2, label:'oil, for the amti'},
        {id:'oil', g:2, label:'oil, for the zunka'}
      ]},
      {id:'dinner', title:'Dinner', dish:'Matki usal and milk', items:[
        {id:'matki', g:95, label:'dry matki, cooked as usal'},
        {id:'veg', g:100, label:'a simple cooked vegetable'},
        {id:'milk', g:500, label:'skimmed milk'},
        {id:'oil', g:2, label:'oil'}
      ]}
    ]
  },
  {
    name:'Sprouts and nachni', short:'Nachni',
    meals:[
      {id:'breakfast', title:'Breakfast', dish:'Besan chilla, sprouted moong, and milk', items:[
        {id:'besan', g:60, label:'besan, one or two chillas'},
        {id:'sprout', g:120, label:'sprouted moong, cooked'},
        {id:'veg', g:50, label:'onion, tomato, and coriander'},
        {id:'oil', g:2, label:'oil'},
        {id:'milk', g:450, label:'skimmed milk'}
      ]},
      {id:'lunch', title:'Lunch', dish:'Nachni bhakri, moong usal, and zunka', items:[
        {id:'nachni', g:50, label:'nachni flour, one bhakri'},
        {id:'moong', g:85, label:'dry moong, cooked as usal'},
        {id:'besan', g:45, label:'besan, cooked as zunka'},
        {id:'veg', g:140, label:'cabbage, cauliflower, or dodka bhaji'},
        {id:'dahi', g:200, label:'low-fat dahi'},
        {id:'oil', g:2, label:'oil'}
      ]},
      {id:'dinner', title:'Dinner', dish:'Masoor amti and milk', items:[
        {id:'masoor', g:95, label:'dry masoor, cooked as amti'},
        {id:'veg', g:140, label:'a simple cooked vegetable'},
        {id:'milk', g:450, label:'skimmed milk'},
        {id:'oil', g:2, label:'oil'}
      ]}
    ]
  },
  {
    name:'Soya dinner', short:'Soya',
    meals:[
      {id:'breakfast', title:'Breakfast', dish:'Oats, sprouted moong, and milk', items:[
        {id:'oats', g:50, label:'rolled oats, cooked in some of the milk'},
        {id:'sprout', g:130, label:'sprouted moong, cooked'},
        {id:'milk', g:450, label:'skimmed milk'},
        {id:'oil', g:2, label:'oil, for the sprouts'}
      ]},
      {id:'lunch', title:'Lunch', dish:'Jowar bhakri, kala chana usal, and zunka', items:[
        {id:'jowar', g:50, label:'jowar flour, one bhakri'},
        {id:'chana', g:80, label:'dry kala chana, soaked and cooked as usal'},
        {id:'besan', g:70, label:'besan, cooked as zunka'},
        {id:'veg', g:110, label:'a simple vegetable bhaji'},
        {id:'dahi', g:200, label:'low-fat dahi'},
        {id:'oil', g:2, label:'oil, for the usal'},
        {id:'oil', g:2, label:'oil, for the zunka'}
      ]},
      {id:'dinner', title:'Dinner', dish:'Soya usal and milk', note:'This is the only soya meal in the 7-day cycle. The weight is dry, before the chunks swell.', items:[
        {id:'soya', g:45, label:'dry soya chunks, cooked as usal'},
        {id:'veg', g:120, label:'a simple cooked vegetable'},
        {id:'milk', g:550, label:'skimmed milk'},
        {id:'oil', g:2, label:'oil'}
      ]}
    ]
  },
  {
    name:'Moong thalipeeth', short:'Thali',
    meals:[
      {id:'breakfast', title:'Breakfast', dish:'Moong-besan thalipeeth and milk', items:[
        {id:'besan', g:55, label:'besan, for the thalipeeth'},
        {id:'moong', g:40, label:'dry moong, soaked and ground into the thalipeeth'},
        {id:'veg', g:60, label:'onion, coriander, and green chilli'},
        {id:'oil', g:2, label:'oil'},
        {id:'milk', g:400, label:'skimmed milk'}
      ]},
      {id:'lunch', title:'Lunch', dish:'Bajra bhakri, chawli amti, and zunka', items:[
        {id:'bajra', g:50, label:'bajri flour, one bhakri'},
        {id:'chawli', g:80, label:'dry chawli, cooked as amti'},
        {id:'besan', g:45, label:'besan, cooked as zunka'},
        {id:'veg', g:140, label:'a simple vegetable bhaji'},
        {id:'dahi', g:200, label:'low-fat dahi'},
        {id:'oil', g:2, label:'oil'}
      ]},
      {id:'dinner', title:'Dinner', dish:'Moong dal and milk', items:[
        {id:'moong', g:90, label:'dry moong, cooked as dal'},
        {id:'veg', g:150, label:'a simple cooked vegetable'},
        {id:'milk', g:450, label:'skimmed milk'},
        {id:'oil', g:2, label:'oil'}
      ]}
    ]
  }
];
