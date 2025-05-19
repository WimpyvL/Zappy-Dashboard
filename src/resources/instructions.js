/**
 * Instruction Templates
 * 
 * This file contains predefined instruction templates for medications and treatments.
 * Providers can select these templates during consultations and customize them if needed.
 * Each template has a unique ID, title, HTML content, associated medication/treatment IDs,
 * and tags for easy filtering.
 */

export const medicationInstructions = [
  {
    id: "semaglutide_injection",
    title: "Semaglutide Injection Instructions",
    content: `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">Before Injection:</h4>
          <ul class="text-blue-800 space-y-1">
            <li>• Wash your hands thoroughly</li>
            <li>• Check expiration date and solution clarity</li>
            <li>• Let pen reach room temperature (15-30 mins)</li>
          </ul>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-2">Injection Site:</h4>
          <p class="text-green-800">Rotate between: thigh, abdomen, or upper arm. Use different site each week.</p>
        </div>
        <div class="bg-amber-50 p-3 rounded-lg">
          <h4 class="font-semibold text-amber-900 mb-2">Timing:</h4>
          <p class="text-amber-800">Same day each week, can be taken with or without food.</p>
        </div>
        <div class="bg-purple-50 p-3 rounded-lg">
          <h4 class="font-semibold text-purple-900 mb-2">Dosage Schedule:</h4>
          <ul class="text-purple-800 space-y-1">
            <li>• Weeks 1-4: 0.25mg once weekly</li>
            <li>• Weeks 5-8: 0.5mg once weekly</li>
            <li>• Week 9+: 1.0mg once weekly (if tolerated)</li>
          </ul>
        </div>
      </div>
    `,
    medicationIds: ["semaglutide", "wegovy", "ozempic"],
    tags: ["injection", "weight-management", "glp-1"]
  },
  {
    id: "tirzepatide_injection",
    title: "Tirzepatide Injection Instructions",
    content: `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">Before Injection:</h4>
          <ul class="text-blue-800 space-y-1">
            <li>• Wash your hands thoroughly</li>
            <li>• Check expiration date and solution clarity</li>
            <li>• Let pen reach room temperature (15-30 mins)</li>
          </ul>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-2">Injection Site:</h4>
          <p class="text-green-800">Rotate between: thigh, abdomen, or upper arm. Use different site each week.</p>
        </div>
        <div class="bg-amber-50 p-3 rounded-lg">
          <h4 class="font-semibold text-amber-900 mb-2">Timing:</h4>
          <p class="text-amber-800">Same day each week, can be taken with or without food.</p>
        </div>
        <div class="bg-purple-50 p-3 rounded-lg">
          <h4 class="font-semibold text-purple-900 mb-2">Dosage Schedule:</h4>
          <ul class="text-purple-800 space-y-1">
            <li>• Weeks 1-4: 2.5mg once weekly</li>
            <li>• Weeks 5-8: 5mg once weekly</li>
            <li>• Weeks 9-12: 7.5mg once weekly</li>
            <li>• Week 13+: 10mg once weekly (if tolerated)</li>
          </ul>
        </div>
      </div>
    `,
    medicationIds: ["tirzepatide", "mounjaro"],
    tags: ["injection", "weight-management", "glp-1", "gip"]
  },
  {
    id: "minoxidil_application",
    title: "Minoxidil Application Instructions",
    content: `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">Before Application:</h4>
          <ul class="text-blue-800 space-y-1">
            <li>• Ensure scalp is clean and dry</li>
            <li>• Part hair to expose scalp</li>
            <li>• Wash hands before and after use</li>
          </ul>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-2">Application:</h4>
          <ul class="text-green-800 space-y-1">
            <li>• Apply 1ml (6 pumps) to affected areas</li>
            <li>• Spread evenly with fingertips</li>
            <li>• Let dry for 2-4 hours before bed</li>
          </ul>
        </div>
        <div class="bg-amber-50 p-3 rounded-lg">
          <h4 class="font-semibold text-amber-900 mb-2">Important:</h4>
          <p class="text-amber-800">Use twice daily. Results typically seen after 3-4 months of consistent use.</p>
        </div>
      </div>
    `,
    medicationIds: ["minoxidil", "rogaine"],
    tags: ["topical", "hair-loss"]
  },
  {
    id: "finasteride_usage",
    title: "Finasteride Usage Instructions",
    content: `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">Dosage:</h4>
          <p class="text-blue-800">Take one 1mg tablet daily with or without food.</p>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-2">Timing:</h4>
          <p class="text-green-800">Take at the same time each day to maintain consistent blood levels.</p>
        </div>
        <div class="bg-amber-50 p-3 rounded-lg">
          <h4 class="font-semibold text-amber-900 mb-2">Important:</h4>
          <ul class="text-amber-800 space-y-1">
            <li>• Women who are pregnant or may become pregnant should not handle crushed or broken tablets</li>
            <li>• Results typically seen after 3-6 months of consistent use</li>
            <li>• Continue treatment to maintain results</li>
          </ul>
        </div>
      </div>
    `,
    medicationIds: ["finasteride", "propecia"],
    tags: ["oral", "hair-loss"]
  },
  {
    id: "sildenafil_usage",
    title: "Sildenafil Usage Instructions",
    content: `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">Dosage:</h4>
          <p class="text-blue-800">Take one tablet (prescribed dosage) approximately 30-60 minutes before sexual activity.</p>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-2">Timing:</h4>
          <ul class="text-green-800 space-y-1">
            <li>• Works best when taken on an empty stomach</li>
            <li>• Effects last approximately 4-6 hours</li>
            <li>• Do not take more than once per day</li>
          </ul>
        </div>
        <div class="bg-amber-50 p-3 rounded-lg">
          <h4 class="font-semibold text-amber-900 mb-2">Important:</h4>
          <ul class="text-amber-800 space-y-1">
            <li>• Do not take with nitrates or recreational drugs</li>
            <li>• Avoid grapefruit juice as it may increase side effects</li>
            <li>• Contact your provider if you experience vision changes, hearing loss, or an erection lasting more than 4 hours</li>
          </ul>
        </div>
      </div>
    `,
    medicationIds: ["sildenafil", "viagra"],
    tags: ["oral", "ed"]
  },
  {
    id: "tadalafil_usage",
    title: "Tadalafil Usage Instructions",
    content: `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">Dosage:</h4>
          <p class="text-blue-800">For as-needed use: Take one tablet (prescribed dosage) at least 30 minutes before sexual activity.</p>
          <p class="text-blue-800">For daily use: Take one tablet (2.5-5mg) at the same time each day.</p>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-2">Timing:</h4>
          <ul class="text-green-800 space-y-1">
            <li>• Can be taken with or without food</li>
            <li>• Effects can last up to 36 hours</li>
            <li>• For as-needed use: Do not take more than once per day</li>
          </ul>
        </div>
        <div class="bg-amber-50 p-3 rounded-lg">
          <h4 class="font-semibold text-amber-900 mb-2">Important:</h4>
          <ul class="text-amber-800 space-y-1">
            <li>• Do not take with nitrates or recreational drugs</li>
            <li>• Limit alcohol consumption</li>
            <li>• Contact your provider if you experience vision changes, hearing loss, or an erection lasting more than 4 hours</li>
          </ul>
        </div>
      </div>
    `,
    medicationIds: ["tadalafil", "cialis"],
    tags: ["oral", "ed"]
  },
  {
    id: "tretinoin_application",
    title: "Tretinoin Application Instructions",
    content: `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">Before Application:</h4>
          <ul class="text-blue-800 space-y-1">
            <li>• Wash face with a mild cleanser and pat dry</li>
            <li>• Wait 20-30 minutes after washing to ensure skin is completely dry</li>
            <li>• Use a pea-sized amount for the entire face</li>
          </ul>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-2">Application:</h4>
          <ul class="text-green-800 space-y-1">
            <li>• Apply a thin layer to affected areas</li>
            <li>• Avoid eyes, mouth, and mucous membranes</li>
            <li>• Apply at night before bed</li>
          </ul>
        </div>
        <div class="bg-amber-50 p-3 rounded-lg">
          <h4 class="font-semibold text-amber-900 mb-2">Important:</h4>
          <ul class="text-amber-800 space-y-1">
            <li>• Use sunscreen daily (SPF 30+) as tretinoin increases sun sensitivity</li>
            <li>• Start with 2-3 times per week and gradually increase frequency</li>
            <li>• Initial redness, peeling, and dryness are normal and should subside</li>
            <li>• Results typically seen after 8-12 weeks of consistent use</li>
          </ul>
        </div>
      </div>
    `,
    medicationIds: ["tretinoin", "retin-a"],
    tags: ["topical", "anti-aging", "acne"]
  }
];

export const generalInstructions = [
  {
    id: "injection_rotation",
    title: "Injection Site Rotation Guide",
    content: `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">Recommended Sites:</h4>
          <ul class="text-blue-800 space-y-1">
            <li>• <strong>Thigh:</strong> Front or outer side, 4 inches above knee</li>
            <li>• <strong>Abdomen:</strong> 2 inches from belly button, avoid waistband</li>
            <li>• <strong>Upper arm:</strong> Back/outer area, have someone help</li>
          </ul>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-2">Rotation Pattern:</h4>
          <p class="text-green-800">Use a different site each week. Mark on calendar or take photos to track.</p>
        </div>
        <div class="bg-amber-50 p-3 rounded-lg">
          <h4 class="font-semibold text-amber-900 mb-2">Injection Technique:</h4>
          <ul class="text-amber-800 space-y-1">
            <li>• Clean site with alcohol swab and let dry</li>
            <li>• Pinch skin if needed (for subcutaneous injections)</li>
            <li>• Insert needle at 90° angle (or 45° if thin)</li>
            <li>• Inject medication slowly</li>
            <li>• Dispose of needle in sharps container</li>
          </ul>
        </div>
      </div>
    `,
    tags: ["injection", "technique", "all-medications"]
  },
  {
    id: "missed_dose",
    title: "Missed Dose Guidelines",
    content: `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">Within 5 Days:</h4>
          <p class="text-blue-800">Take the missed dose as soon as you remember, then continue with your regular schedule.</p>
        </div>
        <div class="bg-amber-50 p-3 rounded-lg">
          <h4 class="font-semibold text-amber-900 mb-2">More Than 5 Days:</h4>
          <p class="text-amber-800">Skip the missed dose and take your next dose on the regularly scheduled day.</p>
        </div>
        <div class="bg-red-50 p-3 rounded-lg">
          <h4 class="font-semibold text-red-900 mb-2">Important:</h4>
          <p class="text-red-800">Contact your healthcare provider if you miss doses frequently.</p>
        </div>
      </div>
    `,
    tags: ["missed-dose", "all-medications"]
  },
  {
    id: "side_effects_management",
    title: "Managing Common Side Effects",
    content: `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">Nausea:</h4>
          <ul class="text-blue-800 space-y-1">
            <li>• Eat smaller, more frequent meals</li>
            <li>• Avoid fatty, spicy, or greasy foods</li>
            <li>• Stay hydrated with clear fluids</li>
            <li>• Try ginger tea or candies</li>
          </ul>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-2">Headache:</h4>
          <ul class="text-green-800 space-y-1">
            <li>• Stay hydrated</li>
            <li>• Rest in a quiet, dark room</li>
            <li>• Apply cool compress to forehead</li>
            <li>• Take over-the-counter pain relievers as directed</li>
          </ul>
        </div>
        <div class="bg-amber-50 p-3 rounded-lg">
          <h4 class="font-semibold text-amber-900 mb-2">Dizziness:</h4>
          <ul class="text-amber-800 space-y-1">
            <li>• Change positions slowly</li>
            <li>• Avoid driving or operating machinery</li>
            <li>• Stay hydrated</li>
            <li>• Sit or lie down if feeling faint</li>
          </ul>
        </div>
        <div class="bg-purple-50 p-3 rounded-lg">
          <h4 class="font-semibold text-purple-900 mb-2">When to Seek Help:</h4>
          <p class="text-purple-800">Contact your healthcare provider if side effects are severe, persistent, or concerning.</p>
        </div>
      </div>
    `,
    tags: ["side-effects", "all-medications"]
  },
  {
    id: "dietary_recommendations_weight",
    title: "Dietary Recommendations for Weight Management",
    content: `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">Protein:</h4>
          <ul class="text-blue-800 space-y-1">
            <li>• Aim for 1.2-1.6g of protein per kg of body weight</li>
            <li>• Include protein with every meal</li>
            <li>• Good sources: lean meats, fish, eggs, tofu, legumes, dairy</li>
          </ul>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-2">Vegetables & Fruits:</h4>
          <ul class="text-green-800 space-y-1">
            <li>• Fill half your plate with non-starchy vegetables</li>
            <li>• Limit fruit to 2-3 servings per day</li>
            <li>• Choose whole fruits over juices</li>
          </ul>
        </div>
        <div class="bg-amber-50 p-3 rounded-lg">
          <h4 class="font-semibold text-amber-900 mb-2">Carbohydrates:</h4>
          <ul class="text-amber-800 space-y-1">
            <li>• Choose complex carbs (whole grains, legumes)</li>
            <li>• Limit refined carbs and added sugars</li>
            <li>• Monitor portion sizes</li>
          </ul>
        </div>
        <div class="bg-purple-50 p-3 rounded-lg">
          <h4 class="font-semibold text-purple-900 mb-2">Hydration:</h4>
          <ul class="text-purple-800 space-y-1">
            <li>• Drink at least 2L of water daily</li>
            <li>• Limit sugary beverages and alcohol</li>
            <li>• Drink water before meals to help with satiety</li>
          </ul>
        </div>
      </div>
    `,
    tags: ["diet", "weight-management"]
  },
  {
    id: "exercise_recommendations",
    title: "Exercise Recommendations",
    content: `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">Cardio:</h4>
          <ul class="text-blue-800 space-y-1">
            <li>• Aim for 150+ minutes of moderate activity per week</li>
            <li>• Examples: walking, cycling, swimming</li>
            <li>• Start with 10-15 minutes and gradually increase</li>
          </ul>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-2">Strength Training:</h4>
          <ul class="text-green-800 space-y-1">
            <li>• Include 2-3 sessions per week</li>
            <li>• Focus on major muscle groups</li>
            <li>• Start with bodyweight exercises if new to training</li>
          </ul>
        </div>
        <div class="bg-amber-50 p-3 rounded-lg">
          <h4 class="font-semibold text-amber-900 mb-2">Flexibility & Balance:</h4>
          <ul class="text-amber-800 space-y-1">
            <li>• Include stretching after workouts</li>
            <li>• Consider yoga or tai chi for balance</li>
            <li>• Aim for 2-3 sessions per week</li>
          </ul>
        </div>
        <div class="bg-purple-50 p-3 rounded-lg">
          <h4 class="font-semibold text-purple-900 mb-2">Important:</h4>
          <ul class="text-purple-800 space-y-1">
            <li>• Start slowly and progress gradually</li>
            <li>• Listen to your body and rest when needed</li>
            <li>• Consistency is more important than intensity</li>
            <li>• Consult your provider before starting a new exercise program</li>
          </ul>
        </div>
      </div>
    `,
    tags: ["exercise", "all-conditions"]
  }
];

export const getAllInstructions = () => {
  return [...medicationInstructions, ...generalInstructions];
};

export const getInstructionById = (id) => {
  return getAllInstructions().find(instruction => instruction.id === id);
};

export const getInstructionsByMedicationId = (medicationId) => {
  return medicationInstructions.filter(instruction => 
    instruction.medicationIds && instruction.medicationIds.includes(medicationId)
  );
};

export const getInstructionsByTag = (tag) => {
  return getAllInstructions().filter(instruction => 
    instruction.tags && instruction.tags.includes(tag)
  );
};
