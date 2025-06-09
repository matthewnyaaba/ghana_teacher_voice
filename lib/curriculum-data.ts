export const GHANA_CURRICULUM = {
  overview: `
    The Ghana B.Ed curriculum is a 4-year program designed to prepare
    professional teachers for basic education (KG-JHS). It emphasizes
    practical skills, inclusive education, and technology integration.
  `,
  
  courses: {
    year1: {
      semester1: [
        {
          code: "EPS 111",
          name: "Educational Psychology",
          credits: 3,
          description: "Introduction to psychological principles in education",
          topics: [
            "Learning theories",
            "Child cognitive development", 
            "Motivation in learning",
            "Individual differences"
          ]
        },
        {
          code: "PFC 111",
          name: "Professional Practice",
          credits: 3,
          description: "Introduction to the teaching profession"
        },
        {
          code: "LIT 111",
          name: "Literacy Studies I",
          credits: 3,
          description: "Developing literacy skills for teaching"
        },
        {
          code: "NUM 111",
          name: "Numeracy and Problem Solving",
          credits: 3,
          description: "Mathematical concepts for basic education"
        }
      ],
      semester2: [
        {
          code: "EPS 121",
          name: "Child Development",
          credits: 3,
          description: "Understanding child growth and development"
        },
        {
          code: "CUR 121",
          name: "Curriculum Studies",
          credits: 3,
          description: "Principles of curriculum design and implementation"
        },
        {
          code: "ICT 121",
          name: "Educational Technology",
          credits: 3,
          description: "Integrating technology in education"
        },
        {
          code: "STS 121",
          name: "School Experience I",
          credits: 3,
          description: "Initial school observation and reflection"
        }
      ]
    }
  },
  
  teachingPractice: {
    year1: "1 week school observation",
    year2: "4 weeks assisted teaching",
    year3: "12 weeks off-campus practice",
    year4: "6 weeks independent teaching"
  },
  
  assessmentStructure: {
    continuous: "40%",
    exams: "60%",
    practicum: "Pass/Fail"
  },
  
  specializations: [
    {
      name: "Early Grade",
      code: "KG-P3",
      focus: "Play-based learning, phonics, early numeracy"
    },
    {
      name: "Upper Primary", 
      code: "P4-P6",
      focus: "Subject specialization, transition pedagogy"
    },
    {
      name: "Junior High School",
      code: "JHS",
      focus: "Subject expertise, adolescent psychology"
    }
  ]
};
