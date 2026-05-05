export interface CollectionEntry {
  id: string
  name: string
  age: number
  is_admin: boolean
  registration_date: Date
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

const names = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank',
  'Ivy', 'Jack', 'Karen', 'Leo', 'Mia', 'Noah', 'Olivia', 'Pete',
  'Quinn', 'Rosa', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xander',
  'Yara', 'Zoe', 'Aaron', 'Bella', 'Carlos', 'Donna'
]

export const MOCK_COLLECTION: CollectionEntry[] = names.map((name) => ({
  id: Math.random().toString(36).slice(2, 14),
  name,
  age: 18 + Math.floor(Math.random() * 50),
  is_admin: Math.random() > 0.7,
  registration_date: randomDate(new Date(2020, 0, 1), new Date()),
}))