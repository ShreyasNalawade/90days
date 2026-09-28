function watch(query){
  return 'https://www.youtube.com/results?search_query='+encodeURIComponent(query);
}
function plain(name){
  return String(name).replace(/[’']/g, "'");
}

// Keys match the exercise name on the session card.
const MOVES = {
  'Easy treadmill walk': {
    steps:[
      'Set the treadmill flat or at a slight incline. Hold the rails only to step on.',
      'Walk for 3 minutes at a pace where you can talk. This is a warm-up, not a workout.',
      'Swing your arms and keep the shoulders loose.'
    ],
    youtube:watch('easy treadmill walk warm up')
  },
  'Arm circles': {
    steps:[
      'Stand tall with arms out to the sides, below shoulder height if overhead is sore.',
      'Make small circles, 10 forward and 10 back. Keep them comfortable.',
      'Stop if a shoulder pinches, slips, or feels unstable.'
    ],
    youtube:watch('arm circles warm up shoulder friendly')
  },
  'Thoracic rotations': {
    steps:[
      'Sit or half-kneel. Hands together in front of the chest.',
      'Rotate the upper back to one side, follow with the eyes, then come back. 8 each side.',
      'Move the ribs, not the low back. Stay in a comfortable range.'
    ],
    youtube:watch('thoracic rotation exercise')
  },
  'Wall slides': {
    steps:[
      'Stand with your back near a wall. Elbows and wrists on the wall if that is comfortable.',
      'Slide the arms up a short way and back down. 10 slow reps.',
      'Stop if the shoulder pinches or feels unstable. A smaller range is fine.'
    ],
    youtube:watch('wall slides shoulder warm up')
  },
  'Scapular push-ups': {
    steps:[
      'Hands on a wall or a bench, body in a straight line. Elbows stay straight.',
      'Let the shoulder blades come together, then push them apart. 10 reps.',
      'This is the shoulders only. Skip any range that hurts.'
    ],
    youtube:watch('scapular push up exercise')
  },
  'Very light chest press': {
    steps:[
      'Use an empty machine or very light dumbbells.',
      'Press for 12 easy reps. Smooth tempo, no grind.',
      'Stop if the front of the shoulder pinches.'
    ],
    youtube:watch('machine chest press form')
  },
  'Band pull-apart': {
    steps:[
      'Hold a light band at shoulder height, hands a little wider than the shoulders.',
      'Pull the band apart until it touches the chest. Squeeze the shoulder blades. 15 slow reps.',
      'Do not shrug. Keep the ribs down.'
    ],
    youtube:watch('band pull apart exercise')
  },
  'Scapular pulldown': {
    steps:[
      'Hold a lat pulldown bar with straight arms.',
      'Without bending the elbows, pull the shoulder blades down and together, then release. 10 reps.',
      'This sets the shoulders before the heavy pulldown.'
    ],
    youtube:watch('scapular pulldown exercise')
  },
  'Very light lat pulldown': {
    steps:[
      'Use a very light stack. Pull the bar to the upper chest, then control it back up.',
      '12 easy reps. Do not lean back or yank the weight.',
      'Stop if a shoulder feels unstable.'
    ],
    youtube:watch('lat pulldown form')
  },
  'Easy bike': {
    steps:[
      'Sit on the bike with a light resistance.',
      'Pedal for 3 minutes at a pace where you can talk.',
      'Keep the knees tracking over the toes.'
    ],
    youtube:watch('stationary bike warm up')
  },
  'Leg swings': {
    steps:[
      'Hold a rack for balance. Swing one leg forward and back like a pendulum.',
      '10 swings each leg. Stay easy. Do not force the hip to the end of the range.',
      'Stand tall. The standing knee stays soft.'
    ],
    youtube:watch('leg swings warm up')
  },
  'Hip circles': {
    steps:[
      'Hands on the hips, feet about shoulder width.',
      'Circle the hips slowly, 8 each direction.',
      'Keep the circles smooth and small enough to stay balanced.'
    ],
    youtube:watch('hip circles warm up')
  },
  'Bodyweight squat': {
    steps:[
      'Feet about shoulder width. Sit the hips back and down, knees over the toes.',
      '10 slow reps. Go only as deep as the heels stay down and the knees feel fine.',
      'Stand by pushing the floor away. Do not bounce out of the bottom.'
    ],
    youtube:watch('bodyweight squat form')
  },
  'Reverse lunge': {
    steps:[
      'Step one foot back and lower until both knees are comfortable. The front knee stays over the foot.',
      '6 each leg, easy range. Use a hand on a rack if you need balance.',
      'Push through the front foot to stand.'
    ],
    youtube:watch('reverse lunge form')
  },
  'Glute bridge': {
    steps:[
      'Lie on your back, knees bent, feet flat.',
      'Squeeze the glutes and lift the hips until the body is a straight line from knees to shoulders. 12 reps.',
      'Do not over-arch the low back.'
    ],
    youtube:watch('glute bridge exercise')
  },
  'Light leg press': {
    steps:[
      'Use a very light sled. Feet about shoulder width on the platform.',
      'Lower until the knees are comfortable, then press back up. 10 easy reps.',
      'Do not lock the knees hard at the top, and do not let the low back round.'
    ],
    youtube:watch('leg press form')
  },
  'Doorway chest stretch': {
    steps:[
      'Forearm on a door frame, elbow around shoulder height.',
      'Step through gently until you feel the chest, not a pinch in the shoulder. Hold 20–30 seconds each side.',
      'Stay in a comfortable range. Stop if the shoulder feels unstable.'
    ],
    youtube:watch('doorway chest stretch')
  },
  'Cross-body shoulder stretch': {
    steps:[
      'Bring one arm across the chest. The other hand rests above the elbow.',
      'Pull gently. Hold 20–30 seconds each side.',
      'Keep it light. Stop if the shoulder pinches.'
    ],
    youtube:watch('cross body shoulder stretch')
  },
  'Lat stretch': {
    steps:[
      'Hold a rack or door frame overhead only as high as the shoulder allows.',
      'Sit the hips back slightly until you feel the side of the back. Hold 20–30 seconds each side.',
      'Stop if the shoulder feels unstable.'
    ],
    youtube:watch('lat stretch exercise')
  },
  'Triceps stretch': {
    steps:[
      'Reach one hand behind the head. The other hand can rest on the elbow.',
      'Ease the elbow back only as far as it stays comfortable. Hold 20–30 seconds each side.',
      'Do not force the shoulder overhead if it pinches.'
    ],
    youtube:watch('overhead triceps stretch')
  },
  "Child's pose": {
    steps:[
      'Kneel, sit the hips toward the heels, and reach the arms forward only as far as the shoulders allow.',
      'Hold 30–45 seconds and breathe. On a rest day, hold closer to 45–60 seconds.',
      'Widen the knees if the hips feel tight. Stop if a shoulder pinches.'
    ],
    youtube:watch("child's pose stretch")
  },
  'Upper-back stretch': {
    steps:[
      'Clasp the hands in front and round the upper back, pushing the hands away.',
      'Hold 20–30 seconds. You should feel the area between the shoulder blades.',
      'Keep the neck long. Do not yank the shoulders.'
    ],
    youtube:watch('upper back stretch exercise')
  },
  'Biceps wall stretch': {
    steps:[
      'Place the palm on a wall, arm slightly behind you, elbow soft.',
      'Turn the body gently away until you feel the biceps. Hold 20–30 seconds each side.',
      'Keep it gentle. Stop if the front of the shoulder complains.'
    ],
    youtube:watch('biceps wall stretch')
  },
  'Rear-delt stretch': {
    steps:[
      'Bring one arm across the chest a little lower than shoulder height.',
      'Hold 20–30 seconds each side. A mild stretch in the back of the shoulder is enough.',
      'Stop if the shoulder feels unstable.'
    ],
    youtube:watch('rear delt stretch')
  },
  'Standing quad stretch': {
    steps:[
      'Stand on one leg, hold a rack if you need it, and hold the other ankle behind you.',
      'Knees stay close. Hold 20–30 seconds each side.',
      'Stand tall. Do not pull the heel hard into the hip.'
    ],
    youtube:watch('standing quad stretch')
  },
  'Hamstring stretch': {
    steps:[
      'Put one heel on a low step or sit and reach toward one foot.',
      'Hinge from the hips until you feel the back of the thigh. Hold 20–30 seconds each side. On a rest day, hold about 30 seconds.',
      'Keep the knee soft. Do not bounce.'
    ],
    youtube:watch('hamstring stretch')
  },
  'Hip flexor stretch': {
    steps:[
      'Half-kneel. Tuck the hips under and shift forward slightly.',
      'Hold 20–30 seconds each side. On a rest day, hold about 30 seconds.',
      'You should feel the front of the hip, not the low back.'
    ],
    youtube:watch('hip flexor stretch half kneeling')
  },
  'Calf stretch': {
    steps:[
      'Hands on a wall. One foot back, heel down, knee straight.',
      'Hold 20–30 seconds each side. On a rest day, hold about 30 seconds.',
      'Then bend that knee slightly for a second short hold if the ankle allows it.'
    ],
    youtube:watch('standing calf stretch')
  },
  'Figure-4 glute stretch': {
    steps:[
      'Lie on your back. Cross one ankle over the other knee.',
      'Pull the uncrossed thigh toward you until you feel the glute. Hold 20–30 seconds each side.',
      'Keep the head down. Do not yank the knee.'
    ],
    youtube:watch('figure 4 glute stretch')
  },
  'Easy walk': {
    steps:[
      'Walk outside or on a treadmill for 30–45 minutes.',
      'Keep the pace easy. You should be able to talk.',
      'This is recovery, not a workout.'
    ],
    youtube:watch('easy walking for recovery')
  },
  'Deep squat hold': {
    steps:[
      'Hold a rack and sit into a squat only as deep as the heels stay down.',
      'Hold 20–30 seconds and breathe. Stand up before the knees complain.',
      'Skip the deep position if the knees or hips are unhappy. A higher hold is fine.'
    ],
    youtube:watch('deep squat hold mobility')
  },
  '90/90 hip switches': {
    steps:[
      'Sit with both knees bent about 90 degrees, one in front and one to the side.',
      'Rotate both legs to the other side, slow. 8–10 each side.',
      'Use your hands on the floor. Stay in an easy range.'
    ],
    youtube:watch('90/90 hip switches')
  },
  "World's Greatest Stretch": {
    steps:[
      'Step into a long lunge. The back knee can rest on the floor.',
      'Put the same-side hand down and rotate the other arm toward the ceiling. 5 each side, easy range.',
      'Do not force the hip or the shoulder.'
    ],
    youtube:watch("world's greatest stretch")
  },
  'Chest opener': {
    steps:[
      'Clasp the hands behind the back, or hold a towel if that is easier.',
      'Lift the chest gently and open the shoulders. Hold about 30 seconds.',
      'Stop if a shoulder feels unstable. A smaller opening is enough.'
    ],
    youtube:watch('chest opener stretch')
  },
  'Incline Dumbbell Press': {
    steps:[
      'Bench at about 30 degrees. Dumbbells at the chest, wrists stacked over the elbows.',
      'Press up and slightly in until the arms are straight, then lower with control. 3 sets.',
      'Keep the shoulders down. Stop if the front of the shoulder pinches.'
    ],
    youtube:watch('incline dumbbell press form')
  },
  'Machine Chest Press': {
    steps:[
      'Seat set so the handles sit around the lower chest. Feet flat.',
      'Press until the arms are straight without locking hard, then return. 3 sets.',
      'Shoulder blades stay on the pad.'
    ],
    youtube:watch('machine chest press tutorial')
  },
  'Cable/Dumbbell Lateral Raise': {
    steps:[
      'Arm slightly in front of the body, elbow soft. Raise to about shoulder height.',
      'Lead with the elbow, not the hand. 3 sets of higher reps.',
      'Use a light weight. Stop if the shoulder pinches on the way up.'
    ],
    youtube:watch('dumbbell lateral raise form')
  },
  'Cable Fly': {
    steps:[
      'Cables set around chest height. Soft elbows, step forward slightly.',
      'Bring the hands together in front of the chest, then open with control. 2 sets.',
      'Keep a small bend in the elbows the whole time.'
    ],
    youtube:watch('cable chest fly form')
  },
  'Rope Triceps Pushdown': {
    steps:[
      'Elbows pinned near the ribs. Rope in the hands.',
      'Push the rope down until the arms are straight, then split the rope slightly. 3 sets.',
      'Only the forearms move. Do not swing the shoulders.'
    ],
    youtube:watch('rope triceps pushdown form')
  },
  'Single-Arm Cable Triceps Extension': {
    steps:[
      'One hand on the cable, elbow beside the head or just in front, whichever the shoulder likes.',
      'Straighten the elbow, then bend it with control. 2 sets each arm.',
      'Skip the overhead path if the shoulder pinches. A pushdown is the substitute.'
    ],
    youtube:watch('single arm cable triceps extension')
  },
  'Lat Pulldown': {
    steps:[
      'Grip a little wider than the shoulders. Sit tall, thighs under the pads.',
      'Pull the bar to the upper chest, elbows toward the hips, then control it up. 3 sets.',
      'Do not pull behind the neck.'
    ],
    youtube:watch('lat pulldown proper form')
  },
  'Chest-Supported Dumbbell Row': {
    steps:[
      'Chest on an incline bench so the low back stays quiet. Dumbbells hanging.',
      'Row the elbows toward the hips and squeeze the shoulder blades. 3 sets.',
      'Lower until the arms are straight. Do not shrug.'
    ],
    youtube:watch('chest supported dumbbell row')
  },
  'Seated Cable Row': {
    steps:[
      'Sit tall, knees soft, shoulders down.',
      'Pull the handle to the lower ribs, pause, then straighten the arms with control. 2 sets.',
      'Do not lean far back to finish the rep.'
    ],
    youtube:watch('seated cable row form')
  },
  'Cable Rear-Delt Fly': {
    steps:[
      'Cables crossed, or use the rear-delt machine. Soft elbows.',
      'Open the arms out to the sides until you feel the back of the shoulders. 3 sets.',
      'Light weight. Stop if a shoulder feels unstable.'
    ],
    youtube:watch('cable rear delt fly')
  },
  'Face Pull': {
    steps:[
      'Rope at face height. Pull toward the forehead, hands finishing beside the ears.',
      'Elbows stay high and the shoulder blades squeeze. 2 sets.',
      'Use a light stack. This is for the rear shoulders, not a heavy row.'
    ],
    youtube:watch('face pull exercise form')
  },
  'Dumbbell Curl': {
    steps:[
      'Stand tall, palms forward, elbows near the ribs.',
      'Curl up without swinging, then lower slowly. 3 sets.',
      'Keep the wrists straight.'
    ],
    youtube:watch('dumbbell biceps curl form')
  },
  'Hammer Curl': {
    steps:[
      'Palms face each other. Elbows stay still.',
      'Curl up and lower with control. 2 sets.',
      'Do not rock the body to get the weight up.'
    ],
    youtube:watch('hammer curl form')
  },
  'Leg Press': {
    steps:[
      'Feet about shoulder width, midway up the platform.',
      'Lower until the knees are comfortable, then press the platform away. 3 sets.',
      'The low back stays on the pad. Do not lock the knees hard.'
    ],
    youtube:watch('leg press proper form')
  },
  'Romanian Deadlift': {
    steps:[
      'Hold the bar or dumbbells in front of the thighs. Soft knees.',
      'Push the hips back until you feel the hamstrings, then stand by squeezing the glutes. 3 sets.',
      'Keep the bar close and the back flat. Do not round to reach lower.'
    ],
    youtube:watch('Romanian deadlift form')
  },
  'Bulgarian Split Squat': {
    steps:[
      'Back foot on a low bench. Front foot far enough that the knee stays comfortable.',
      'Lower straight down, then drive through the front foot. 2 or 3 sets, depending on the phase on the card.',
      'Hold a rack if balance is shaky. A shorter range is fine.'
    ],
    youtube:watch('Bulgarian split squat form')
  },
  'Seated/Lying Leg Curl': {
    steps:[
      'Pad sits just above the heels. Hips stay down.',
      'Curl the heels toward you, pause, then lower slowly. 3 sets.',
      'Do not lift the hips to squeeze out extra reps.'
    ],
    youtube:watch('lying leg curl form')
  },
  'Leg Extension': {
    steps:[
      'Pad on the lower shins. Back against the seat.',
      'Straighten the knees, pause, then lower with control. 2 sets.',
      'Do not swing. Stop if the knees complain at the top.'
    ],
    youtube:watch('leg extension machine form')
  },
  'Standing Calf Raise': {
    steps:[
      'Balls of the feet on the step, heels hanging.',
      'Rise as high as you can, pause, then lower the heels below the step. 3 sets.',
      'Keep the knees soft and the body still.'
    ],
    youtube:watch('standing calf raise form')
  },
  'Cable Crunch': {
    steps:[
      'Kneel facing the cable. Rope beside the head, or hands on the collar.',
      'Curl the ribs toward the hips. The hips stay still. 3 sets.',
      'Do not pull the weight by yanking the arms.'
    ],
    youtube:watch('cable crunch form')
  },
  '15–20 min easy or moderate incline treadmill walk': {
    steps:[
      'After the last lift, set a walking incline you can hold.',
      'Walk 15–20 minutes, easy or moderate. You should still speak in short sentences.',
      'Then go to the stretches.'
    ],
    youtube:watch('incline treadmill walk')
  },
  '12–15 min easy cycling or incline walk': {
    steps:[
      'After the lifts, bike easy or walk on an incline for 12–15 minutes.',
      'Keep it conversational. This is extra work for the heart, not a sprint.',
      'Then stretch.'
    ],
    youtube:watch('easy cycling cool down')
  },
  '10–15 min easy cycling or walking': {
    steps:[
      'After the leg work, cycle or walk easy for 10–15 minutes.',
      'Light resistance. The legs should loosen, not burn out.',
      'Then stretch.'
    ],
    youtube:watch('easy walk or bike after leg day')
  }
};

export function moveFor(name){
  const found = MOVES[plain(name)];
  if(found) return found;
  return {
    steps:[
      'Use the sets, reps, and rest written on the card.',
      'Move smoothly. Stop if a joint pinches, slips, or feels unstable.',
      'Leave about 2 reps in reserve unless the phase card says otherwise.'
    ],
    youtube:watch(plain(name)+' exercise form')
  };
}
