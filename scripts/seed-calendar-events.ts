import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Type for color
type EventColor = "blue" | "green" | "purple" | "orange" | "red";

// Event name templates
const eventTemplates = {
  meetings: [
    {
      prefix: "Team",
      topics: ["Sync", "Standup", "Planning", "Retrospective", "Brainstorming"],
    },
    {
      prefix: "Strategy",
      topics: ["Session", "Planning", "Review", "Workshop", "Alignment"],
    },
    {
      prefix: "1-on-1",
      topics: [
        "with Manager",
        "with Team Lead",
        "with HR",
        "Check-in",
        "Feedback Session",
      ],
    },
    {
      prefix: "Client",
      topics: ["Meeting", "Presentation", "Review", "Kickoff", "Update Call"],
    },
    {
      prefix: "Project",
      topics: [
        "Kickoff",
        "Status Update",
        "Review",
        "Planning",
        "Sprint Planning",
      ],
    },
    {
      prefix: "Department",
      topics: [
        "All-Hands",
        "Update",
        "Town Hall",
        "Q&A Session",
        "Announcement",
      ],
    },
  ],
  deadlines: [
    {
      prefix: "Submit",
      topics: [
        "Quarterly Report",
        "Monthly Metrics",
        "Performance Review",
        "Budget Proposal",
        "Project Proposal",
      ],
    },
    {
      prefix: "Complete",
      topics: [
        "Phase 1 Deliverables",
        "Code Review",
        "Documentation",
        "Testing Phase",
        "User Acceptance Testing",
      ],
    },
    {
      prefix: "Finalize",
      topics: [
        "Design Mockups",
        "Marketing Plan",
        "Training Materials",
        "Onboarding Docs",
        "Process Documentation",
      ],
    },
    {
      prefix: "Review",
      topics: [
        "Annual Budget",
        "Team Performance",
        "Project Outcomes",
        "Risk Assessment",
        "Compliance Audit",
      ],
    },
  ],
  events: [
    {
      prefix: "Company",
      topics: [
        "All-Hands Meeting",
        "Holiday Party",
        "Team Building",
        "Annual Retreat",
        "Summer Picnic",
      ],
    },
    {
      prefix: "Training",
      topics: [
        "Workshop",
        "New Software Training",
        "Leadership Development",
        "Safety Training",
        "Compliance Training",
      ],
    },
    {
      prefix: "Workshop",
      topics: [
        "Innovation Lab",
        "Design Thinking",
        "Agile Methodology",
        "Data Analysis",
        "Customer Experience",
      ],
    },
    {
      prefix: "Webinar",
      topics: [
        "Industry Trends",
        "Best Practices",
        "New Technology",
        "Case Study Review",
        "Expert Panel",
      ],
    },
  ],
  holidays: [
    {
      prefix: "",
      topics: [
        "New Year's Day",
        "Martin Luther King Jr. Day",
        "Presidents' Day",
        "Memorial Day",
        "Independence Day",
        "Labor Day",
        "Thanksgiving",
        "Christmas Eve",
        "Christmas Day",
        "New Year's Eve",
      ],
    },
    {
      prefix: "Company Holiday - ",
      topics: [
        "Winter Break",
        "Summer Friday",
        "Floating Holiday",
        "Wellness Day",
        "Community Service Day",
      ],
    },
  ],
  reviews: [
    {
      prefix: "Q1",
      topics: [
        "Performance Review",
        "Goal Setting",
        "360 Feedback",
        "Career Development",
        "Compensation Review",
      ],
    },
    {
      prefix: "Q2",
      topics: [
        "Performance Review",
        "Goal Setting",
        "360 Feedback",
        "Career Development",
        "Compensation Review",
      ],
    },
    {
      prefix: "Q3",
      topics: [
        "Performance Review",
        "Goal Setting",
        "360 Feedback",
        "Career Development",
        "Compensation Review",
      ],
    },
    {
      prefix: "Q4",
      topics: [
        "Performance Review",
        "Goal Setting",
        "360 Feedback",
        "Career Development",
        "Compensation Review",
      ],
    },
    {
      prefix: "Mid-Year",
      topics: [
        "Review Session",
        "Goal Check-in",
        "Development Planning",
        "Feedback Session",
        "Career Path Discussion",
      ],
    },
    {
      prefix: "Annual",
      topics: [
        "Performance Review",
        "Goal Setting",
        "360 Feedback",
        "Career Development",
        "Compensation Review",
      ],
    },
  ],
  social: [
    {
      prefix: "Team",
      topics: ["Lunch", "Happy Hour", "Coffee Chat", "Game Night", "Book Club"],
    },
    {
      prefix: "Office",
      topics: [
        "Birthday Celebration",
        "Farewell Party",
        "Welcome Lunch",
        "Anniversary Celebration",
        "Baby Shower",
      ],
    },
    {
      prefix: "Networking",
      topics: [
        "Lunch & Learn",
        "Mentorship Session",
        "Cross-Team Meetup",
        "Industry Mixer",
        "Alumni Gathering",
      ],
    },
  ],
};

const colors: EventColor[] = ["blue", "green", "purple", "orange", "red"];

const descriptions = [
  "Important event that requires your attendance. Please review the agenda beforehand.",
  "Join us for this scheduled activity. Details will be shared closer to the date.",
  "Mark your calendar for this important occasion. Further information to follow.",
  "This event is part of our ongoing commitment to team development and collaboration.",
  "Please prepare any necessary materials and be ready to contribute.",
  "An opportunity to connect with colleagues and share insights.",
  "Key stakeholders will be present. Please come prepared with updates.",
  "This session will cover important topics relevant to our team's success.",
  "Don't miss this chance to learn and grow with the team.",
  "A regular check-in to ensure we're aligned on goals and progress.",
  "Focus will be on strategic planning and execution for the upcoming period.",
  "Please review previous notes and come with questions.",
  "This is a mandatory session for all team members.",
  "Optional but highly recommended for professional development.",
  "Bring your ideas and enthusiasm for this collaborative session.",
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateEventName(category: string): string {
  const categoryTemplates =
    eventTemplates[category as keyof typeof eventTemplates];
  if (!categoryTemplates) return "Calendar Event";

  const template = getRandomItem(categoryTemplates);
  if (template.prefix) {
    return `${template.prefix} ${getRandomItem(template.topics)}`;
  }
  return getRandomItem(template.topics);
}

function generateEventDescription(): string {
  return getRandomItem(descriptions);
}

function getRandomDayInMonth(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Math.floor(Math.random() * daysInMonth) + 1;
}

function getRandomHour(): number {
  // Business hours: 9 AM to 5 PM
  return Math.floor(Math.random() * 9) + 9;
}

async function main() {
  console.log("🌱 Seeding calendar events...");

  // Get all companies
  const companies = await prisma.company.findMany();
  console.log(`Found ${companies.length} companies`);

  // Group users by company
  const usersByCompany: Record<number, any[]> = {};

  for (const company of companies) {
    const users = await prisma.user.findMany({
      where: { companyId: company.id },
      take: 10,
    });

    if (users.length > 0) {
      usersByCompany[company.id] = users;
      console.log(
        `  • Company ${company.id} (${company.name}): ${users.length} users`,
      );
    }
  }

  const categories = Object.keys(eventTemplates);
  const startDate = new Date(2026, 0, 1); // January 2026
  const endDate = new Date(2030, 11, 31); // December 2030

  const events = [];
  let eventCount = 0;

  for (
    let year = startDate.getFullYear();
    year <= endDate.getFullYear();
    year++
  ) {
    for (let month = 0; month <= 11; month++) {
      // Skip if before start date or after end date
      if (year === startDate.getFullYear() && month < startDate.getMonth())
        continue;
      if (year === endDate.getFullYear() && month > endDate.getMonth())
        continue;

      // Generate 2-4 events per month
      const eventsThisMonth = Math.floor(Math.random() * 3) + 2;

      for (let i = 0; i < eventsThisMonth; i++) {
        const category = getRandomItem(categories);
        const day = getRandomDayInMonth(year, month);
        const startHour = getRandomHour();
        const duration = Math.floor(Math.random() * 3) + 1; // 1-3 hours

        const startDateEvent = new Date(year, month, day, startHour, 0, 0);
        const endDateEvent = new Date(
          year,
          month,
          day,
          startHour + duration,
          0,
          0,
        );

        // Pick random company for this event
        const randomCompanyId = getRandomItem(
          Object.keys(usersByCompany).map(Number),
        );
        const companyUsers = usersByCompany[randomCompanyId];
        const randomUser = getRandomItem(companyUsers);

        events.push({
          title: generateEventName(category),
          description: generateEventDescription(),
          startDate: startDateEvent,
          endDate: endDateEvent,
          color: getRandomItem(colors) as EventColor,
          createdBy: randomUser.id,
          companyId: randomCompanyId,
        });

        eventCount++;
      }
    }
  }

  console.log(`Generated ${eventCount} events from Jan 2026 to Dec 2030`);

  // Insert events in batches
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    await prisma.calendarEvent.createMany({
      data: batch,
    });
    inserted += batch.length;
    console.log(`Inserted ${inserted}/${events.length} events...`);
  }

  console.log(`✅ Successfully seeded ${eventCount} calendar events!`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding calendar events:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
