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
    focus:'Chest, shoulders, triceps',
    cardio:'5–8 min easy incline walk',
    exercises:[
      {name:'Machine/DB Chest Press', sets:3, reps:'8–12', rest:'90 sec'},
      {name:'Incline Dumbbell Press', sets:3, reps:'8–12', rest:'90 sec'},
      {name:'Cable/Dumbbell Lateral Raise', sets:3, reps:'12–15', rest:'60 sec'},
      {name:'Cable Triceps Pushdown', sets:3, reps:'10–15', rest:'60 sec'},
      {name:'Overhead Cable Triceps Extension', sets:2, reps:'10–15', rest:'60 sec'}
    ]
  },
  pull:{
    title:'Pull',
    focus:'Back, rear delts, biceps',
    cardio:'5–8 min easy incline walk',
    exercises:[
      {name:'Lat Pulldown', sets:3, reps:'8–12', rest:'90 sec'},
      {name:'Seated Cable Row', sets:3, reps:'8–12', rest:'90 sec'},
      {name:'Chest-Supported Dumbbell Row', sets:2, reps:'8–12', rest:'90 sec'},
      {name:'Face Pull', sets:2, reps:'12–15', rest:'60 sec'},
      {name:'Dumbbell Curl', sets:3, reps:'10–15', rest:'60 sec'},
      {name:'Hammer Curl', sets:2, reps:'10–15', rest:'60 sec'}
    ]
  },
  legs:{
    title:'Legs',
    focus:'Quads, hamstrings, glutes, calves',
    cardio:'5 min easy walk',
    exercises:[
      {name:'Leg Press', sets:3, reps:'8–12', rest:'120 sec'},
      {name:'Romanian Deadlift', sets:3, reps:'8–12', rest:'120 sec'},
      {name:'Leg Extension', sets:2, reps:'10–15', rest:'75 sec'},
      {name:'Seated/Lying Leg Curl', sets:3, reps:'10–15', rest:'75 sec'},
      {name:'Standing/Seated Calf Raise', sets:3, reps:'12–20', rest:'60 sec'},
      {name:'Plank', sets:2, reps:'30–60 sec', rest:'60 sec', hold:true}
    ]
  }
};

// Warm-up before the lifts, and stretching after. Keys match WORKOUTS.
const PREP = {
  push:{
    warmup:[
      {name:'Easy walk or bike', how:'2 minutes, easy pace'},
      {name:'Arm circles', how:'10 each way, small then a little bigger'},
      {name:'Band pull-apart', how:'12 slow reps'},
      {name:'Light chest press', how:'10 easy reps, very light'}
    ],
    stretch:[
      {name:'Doorway chest stretch', how:'Hold 20–30 sec each side'},
      {name:'Cross-body shoulder stretch', how:'Hold 20–30 sec each side, gentle'},
      {name:'Triceps stretch', how:'Hold 20–30 sec each side, comfortable range only'},
      {name:'Child’s pose', how:'Hold 30 sec and breathe'}
    ]
  },
  pull:{
    warmup:[
      {name:'Easy walk or bike', how:'2 minutes, easy pace'},
      {name:'Arm circles', how:'10 each way, small then a little bigger'},
      {name:'Band pull-apart', how:'12 slow reps'},
      {name:'Light lat pulldown', how:'10 easy reps, very light'}
    ],
    stretch:[
      {name:'Lat stretch on a post', how:'Hold 20–30 sec each side'},
      {name:'Doorway chest stretch', how:'Hold 20–30 sec'},
      {name:'Biceps wall stretch', how:'Hold 20–30 sec each side, gentle'},
      {name:'Upper-back hug stretch', how:'Hold 20–30 sec'}
    ]
  },
  legs:{
    warmup:[
      {name:'Easy walk or bike', how:'2 minutes, easy pace'},
      {name:'Leg swings', how:'8 each leg, front to back'},
      {name:'Bodyweight squat', how:'10 slow reps'},
      {name:'Light leg press', how:'10 easy reps, very light'}
    ],
    stretch:[
      {name:'Standing quad stretch', how:'Hold 20–30 sec each side'},
      {name:'Hamstring stretch', how:'Hold 20–30 sec each side'},
      {name:'Hip flexor lunge stretch', how:'Hold 20–30 sec each side'},
      {name:'Calf stretch on a wall', how:'Hold 20–30 sec each side'},
      {name:'Figure-4 glute stretch', how:'Hold 20–30 sec each side'}
    ]
  }
};
// Optional stretches on Sundays and holidays.
const REST_MOBILITY = [
  {name:'Easy walk', how:'10–20 minutes, optional'},
  {name:'Hip flexor stretch', how:'Hold 20–30 sec each side'},
  {name:'Hamstring stretch', how:'Hold 20–30 sec each side'},
  {name:'Chest and shoulder opener', how:'Hold 20–30 sec, comfortable range'},
  {name:'Cat-cow or child’s pose', how:'5 slow breaths'}
];

// Day ranges are 0-based. 0–30 is days 1–30, and so on.
const PHASES = [
  {name:'Foundation', from:0, to:30, text:'Learn each lift and stop 1–2 reps before failure. The card uses the base sets and reps.'},
  {name:'Progression', from:30, to:60, text:'Compound lifts written as 8–12 move to 8–10. The chest-supported row goes from 2 sets to 3.'},
  {name:'Intensification', from:60, to:90, text:'The original 3×8–12 lifts move to 6–10. Accessory work stays the same. Keep the reps strict.'}
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
  veg:{kcal:0.25,p:0.012,f:0.020},
  oil:{kcal:9,p:0,f:0},
  dahi:{kcal:0.44,p:0.043,f:0},
  paneer:{kcal:2.65,p:0.18,f:0},
  soya:{kcal:3.45,p:0.52,f:0.13},
  sprout:{kcal:0.30,p:0.030,f:0.016},
  taak:{kcal:0.15,p:0.008,f:0}
};
// Three meal days. The app repeats them in order.
const MENUS = [
  {
    name:'Oats and pithla', short:'Oats',
    paneerSlot:'lunch', paneerFrom:'moong', soySlot:'dinner', soyFrom:'moong',
    meals:[
      {id:'breakfast', title:'Breakfast', dish:'Shengdana oats and milk', items:[
        {id:'oats', g:30, label:'rolled oats, cooked in some of the milk'},
        {id:'milk', g:300, label:'skimmed milk, for cooking the oats'},
        {id:'milk', g:350, label:'skimmed milk, to drink'},
        {id:'peanut', g:12, label:'roasted peanuts, crushed'},
        {id:'dahi', g:220, label:'low-fat dahi'}
      ]},
      {id:'lunch', title:'Lunch', dish:'Jowar bhakri and pithla', items:[
        {id:'jowar', g:40, label:'jowar flour, one bhakri'},
        {id:'besan', g:75, label:'besan, cooked as pithla'},
        {id:'moong', g:80, label:'dry moong, cooked as thick dal'},
        {id:'veg', g:100, label:'koshimbir or a simple bhaji'},
        {id:'oil', g:2, label:'oil'}
      ]},
      {id:'dinner', title:'Dinner', dish:'Moong amti, dahi, and milk', items:[
        {id:'moong', g:100, label:'dry moong, cooked as amti'},
        {id:'veg', g:80, label:'cucumber, tomato, or a cooked vegetable'},
        {id:'milk', g:350, label:'skimmed milk'},
        {id:'dahi', g:80, label:'low-fat dahi'},
        {id:'oil', g:2, label:'oil'}
      ]}
    ]
  },
  {
    name:'Besan chilla', short:'Chilla',
    paneerSlot:'lunch', paneerFrom:'moong', soySlot:'dinner', soyFrom:'masoor',
    meals:[
      {id:'breakfast', title:'Breakfast', dish:'Besan chilla', items:[
        {id:'besan', g:85, label:'besan, two chillas'},
        {id:'veg', g:70, label:'onion, tomato, coriander, and green chilli'},
        {id:'oil', g:2, label:'oil'},
        {id:'milk', g:450, label:'skimmed milk'},
        {id:'dahi', g:200, label:'low-fat dahi'}
      ]},
      {id:'lunch', title:'Lunch', dish:'Jowar bhakri and matki usal', items:[
        {id:'jowar', g:40, label:'jowar flour, one bhakri'},
        {id:'matki', g:60, label:'dry matki, cooked as usal'},
        {id:'moong', g:70, label:'dry moong, cooked as amti'},
        {id:'veg', g:100, label:'bhaji such as palak, methi, cabbage, or dodka'},
        {id:'oil', g:2, label:'oil'},
        {id:'taak', g:100, label:'taak'}
      ]},
      {id:'dinner', title:'Dinner', dish:'Masoor amti and milk', items:[
        {id:'masoor', g:100, label:'dry masoor, cooked as amti'},
        {id:'veg', g:80, label:'salad or a simple vegetable'},
        {id:'milk', g:400, label:'skimmed milk'},
        {id:'oil', g:2, label:'oil'}
      ]}
    ]
  },
  {
    name:'Sprouts and zunka', short:'Zunka',
    paneerSlot:'dinner', paneerFrom:'moong', soySlot:'lunch', soyFrom:'chawli',
    meals:[
      {id:'breakfast', title:'Breakfast', dish:'Besan chilla and sprouted moong', items:[
        {id:'besan', g:50, label:'besan, one chilla'},
        {id:'sprout', g:150, label:'sprouted moong, cooked'},
        {id:'milk', g:450, label:'skimmed milk'},
        {id:'dahi', g:200, label:'low-fat dahi'},
        {id:'peanut', g:10, label:'roasted peanuts'},
        {id:'oil', g:2, label:'oil'}
      ]},
      {id:'lunch', title:'Lunch', dish:'Bajri bhakri, chawli, and zunka', items:[
        {id:'bajra', g:40, label:'bajri flour, one bhakri'},
        {id:'chawli', g:70, label:'dry chawli, cooked as usal'},
        {id:'besan', g:55, label:'besan, cooked as zunka'},
        {id:'veg', g:100, label:'any simple vegetable bhaji'},
        {id:'oil', g:2, label:'oil'},
        {id:'milk', g:100, label:'skimmed milk'}
      ]},
      {id:'dinner', title:'Dinner', dish:'Moong dal and kala chana', items:[
        {id:'moong', g:90, label:'dry moong, cooked as dal'},
        {id:'chana', g:25, label:'dry kala chana, soaked and boiled'},
        {id:'veg', g:80, label:'cucumber and tomato salad'},
        {id:'milk', g:300, label:'skimmed milk'},
        {id:'dahi', g:60, label:'low-fat dahi'},
        {id:'oil', g:2, label:'oil'}
      ]}
    ]
  }
];
