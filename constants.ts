import { AgeGroup, Exercise } from './types';

export const EXERCISES: Record<AgeGroup, Exercise[]> = {
  [AgeGroup.CHILDREN]: [
    { id: 'c_jj', name: 'Jumping Jacks', description: 'Jumping movement to warm up the whole body.', benefits: 'Good for heart and balance.', difficulty: 'Easy', duration: '3 min', category: 'Main', muscleGroup: 'Full Body', calories: 30 },
    { id: 'c_kp', name: 'Knee Pushups', description: 'Easier pushups using your knees for support.', benefits: 'Strengthens chest and arms safely.', difficulty: 'Medium', duration: '4 min', category: 'Main', muscleGroup: 'Upper Body', calories: 40 },
    { id: 'c_hk', name: 'High Knees', description: 'Running in place lifting knees high.', benefits: 'Good for energy and legs.', difficulty: 'Medium', duration: '3 min', category: 'Main', muscleGroup: 'Cardio', calories: 50 }
  ],
  [AgeGroup.YOUNG_ADULTS]: [
    { id: 'y_pu', name: 'Push Ups', description: 'Basic exercise to build chest and arm strength.', benefits: 'Builds muscle and bone strength.', difficulty: 'Hard', duration: '5 min', category: 'Main', muscleGroup: 'Chest/Arms', calories: 60 },
    { id: 'y_sq', name: 'Squats', description: 'Sit and stand motion to strengthen legs.', benefits: 'Burns calories and builds leg power.', difficulty: 'Medium', duration: '6 min', category: 'Main', muscleGroup: 'Glutes/Quads', calories: 85 },
    { id: 'y_ln', name: 'Lunges', description: 'Step forward and bend knees for balance.', benefits: 'Tones legs and improves balance.', difficulty: 'Medium', duration: '5 min', category: 'Main', muscleGroup: 'Legs', calories: 70 }
  ],
  [AgeGroup.ADULTS]: [
    { id: 'a_pl', name: 'Plank', description: 'Hold body straight to strengthen stomach muscles.', benefits: 'Good for back and core strength.', difficulty: 'Medium', duration: '3 min', category: 'Main', muscleGroup: 'Core', calories: 25 },
    { id: 'a_gb', name: 'Glute Bridge', description: 'Lie down and lift hips up.', benefits: 'Fixes posture from sitting too long.', difficulty: 'Easy', duration: '5 min', category: 'Main', muscleGroup: 'Glutes/Back', calories: 45 },
    { id: 'a_bd', name: 'Bird Dog', description: 'Lift opposite arm and leg while on hands and knees.', benefits: 'Improves balance and back health.', difficulty: 'Easy', duration: '5 min', category: 'Main', muscleGroup: 'Core/Balance', calories: 35 }
  ],
  [AgeGroup.SENIORS]: [
    { id: 's_sl', name: 'Seated Leg Raises', description: 'Lift legs up while sitting on a chair.', benefits: 'Keeps knees healthy and strong.', difficulty: 'Easy', duration: '6 min', category: 'Main', muscleGroup: 'Quadriceps', calories: 20 },
    { id: 's_hr', name: 'Heel Raises', description: 'Stand holding a chair and lift your heels.', benefits: 'Strengthens calves and ankles.', difficulty: 'Easy', duration: '5 min', category: 'Main', muscleGroup: 'Calves', calories: 25 },
    { id: 's_ar', name: 'Seated Arm Raises', description: 'Lift arms overhead while sitting.', benefits: 'Improves shoulder movement.', difficulty: 'Easy', duration: '5 min', category: 'Main', muscleGroup: 'Shoulders', calories: 20 }
  ]
};
