import { BookContent } from "./schema";

export const bookContent: BookContent = {
  title: "Introduction to Symbolic Logic",
  author: "J.-M. Kuczynski PhD",
  sections: [
    {
      id: "week-1",
      title: "Week 1: Basic Concepts, Notation, and Logical Operators",
      content: `# Introduction to Logic

Logic is the study of valid reasoning.

In this course, we'll focus on symbolic logic, which uses special symbols and precise rules to analyze and evaluate arguments.

Unlike informal logic, symbolic logic gives us tools to determine validity with mathematical precision.

## Basic Concepts

**Statement (Proposition)**: A sentence that is either true or false, but not both

**Argument**: A sequence of statements where one (the conclusion) is claimed to follow from the others (the premises)

**Validity**: An argument is valid if it's impossible for all premises to be true while the conclusion is false

**Soundness**: A valid argument with true premises

## Basic Logical Symbols

### Negation (¬): "not"
Example:
- If p = "It is raining"
- Then ¬p = "It is not raining"

### Conjunction (∧): "and"
Example:
- If p = "It is cold" and q = "It is windy"
- Then p ∧ q = "It is cold and windy"

### Disjunction (∨): "or"
Example:
- If p = "I will study" and q = "I will fail"
- Then p ∨ q = "I will study or I will fail"

### Conditional (→): "if...then"
Example:
- If p = "It rains" and q = "The ground is wet"
- Then p → q = "If it rains, then the ground is wet"

## Material vs. Strict Implication

### Material Implication (→)
- Truth-functional: defined purely by truth values
- False only when antecedent is true and consequent is false
- Example: "If it rains, then the ground is wet"

### Strict Implication (⊃)
- Modal: involves necessary connection
- Example: "If x is a bachelor, then x is unmarried"
- Represents logical necessity rather than mere material implication

## Translation Practice

### From English to Symbolic Notation:

1. "It's not both sunny and warm"
   - Let p = "It's sunny", q = "It's warm"
   - Translation: ¬(p ∧ q)

2. "Either I'll go to the party or I'll stay home and study"
   - Let p = "I'll go to the party", q = "I'll stay home", r = "I'll study"
   - Translation: p ∨ (q ∧ r)

### From Symbolic Notation to English:

p → (q ∨ r)
- Let p = "It rains", q = "I take an umbrella", r = "I stay inside"
- Translation: "If it rains, then I'll either take an umbrella or stay inside"

## Practice Exercises

Translate these statements into symbolic notation:

1. "If I study hard and get enough sleep, then I'll pass the exam"
2. "It's not true that I'll both go to the movies and save money"
3. "Either I'll finish my homework or I won't watch TV"

[Solutions will be discussed next class]

## Key Takeaways

- Symbolic logic provides precise tools for analyzing arguments
- Basic operators (¬, ∧, ∨, →) can combine to express complex statements
- Translation between natural language and logical notation requires careful attention to meaning
- Material implication differs from strict implication in important ways

Next week, we'll explore truth tables and begin formal proofs using these concepts.`
    },
    {
      id: "homework-1",
      title: "Homework 1: Basic Concepts and Notation",
      content: `# Symbolic Logic - Homework 1
## Basic Concepts and Notation
**Total Points: 50**

### Part 1: Translation (20 points)

Translate the following English statements into symbolic logic notation.

Let:
- p = "It rains"
- q = "The streets are wet"
- r = "People use umbrellas"
- s = "Traffic slows down"

1. "If it rains, then the streets are wet and people use umbrellas." (5 points)
2. "Either traffic slows down or it's not raining." (5 points)
3. "It's not true that when it rains, traffic slows down." (5 points)
4. "If the streets are wet and people use umbrellas, then it must be raining." (5 points)

### Part 2: Symbolization (20 points)

Create appropriate symbols and translate these statements into logical notation:

1. "If John studies and gets tutoring, then he will pass the class. John studies and gets tutoring. Therefore, John will pass the class." (10 points)

2. "Either Mary goes to the gym or she goes for a run, but not both. If she goes for a run, she will be tired." (10 points)

### Part 3: Analysis (10 points)

Explain the difference between material implication and strict implication using an example of each. (10 points)

### Grading Rubric:
- Part 1: 5 points per correct translation
- Part 2: 10 points per correct symbolization and translation
- Part 3: 5 points for correct explanation of the difference, 5 points for appropriate examples

## Answer Key

### Part 1: Translation (20 points)

1. "If it rains, then the streets are wet and people use umbrellas." (5 points)
   **Answer**: p → (q ∧ r)

2. "Either traffic slows down or it's not raining." (5 points)
   **Answer**: s ∨ ¬p

3. "It's not true that when it rains, traffic slows down." (5 points)
   **Answer**: ¬(p → s)

4. "If the streets are wet and people use umbrellas, then it must be raining." (5 points)
   **Answer**: (q ∧ r) → p

### Part 2: Symbolization (20 points)

1. "If John studies and gets tutoring, then he will pass the class. John studies and gets tutoring. Therefore, John will pass the class." (10 points)

   **Answer**:
   - Let s = "John studies"
   - Let t = "John gets tutoring"
   - Let p = "John will pass the class"
   - Translation: ((s ∧ t) → p) ∧ (s ∧ t) → p

2. "Either Mary goes to the gym or she goes for a run, but not both. If she goes for a run, she will be tired." (10 points)

   **Answer**:
   - Let g = "Mary goes to the gym"
   - Let r = "Mary goes for a run"
   - Let t = "Mary will be tired"
   - Translation: ((g ∨ r) ∧ ¬(g ∧ r)) ∧ (r → t)

### Part 3: Analysis (10 points)

**Answer**:

Material implication (→) is truth-functional and is false only when the antecedent is true and the consequent is false.

Example: "If it rains, then the ground is wet" (p → q). This is a material implication because it's based on observed correlation.

Strict implication (⊃) involves logical necessity.

Example: "If x is a square, then x has four equal sides." This is a strict implication because it's based on the definition of a square - it's impossible for the antecedent to be true and the consequent false by logical necessity.`
    },
    {
      id: "week-2",
      title: "Week 2: Truth Tables and Elementary Proofs",
      content: `# Propositional Calculus and Truth Tables

## The Propositional Calculus

Propositional calculus is a formal system for representing and analyzing logical relationships between propositions.

It provides rules for:
- Constructing well-formed formulas
- Evaluating truth values
- Making valid inferences

## Truth Tables

Truth tables systematically show all possible truth value combinations for propositional statements.

### Basic Truth Tables

#### Negation (¬)
| p | ¬p |
|---|----| 
| T | F  |
| F | T  |

#### Conjunction (∧)
| p | q | p ∧ q |
|---|---|-------|
| T | T | T     |
| T | F | F     |
| F | T | F     |
| F | F | F     |

#### Disjunction (∨)
| p | q | p ∨ q |
|---|---|-------|
| T | T | T     |
| T | F | T     |
| F | T | T     |
| F | F | F     |

#### Conditional (→)
| p | q | p → q |
|---|---|-------|
| T | T | T     |
| T | F | F     |
| F | T | T     |
| F | F | T     |

## Elementary Proofs

Proofs in propositional logic use rules of inference to derive conclusions from premises.

### Key Rules of Inference:

#### Modus Ponens (MP)
From p → q and p, infer q

Example:
- If it rains, the ground is wet (p → q)
- It is raining (p)
- Therefore, the ground is wet (q)

#### Modus Tollens (MT)
From p → q and ¬q, infer ¬p

Example:
- If it rains, the ground is wet (p → q)
- The ground is not wet (¬q)
- Therefore, it is not raining (¬p)

#### Disjunctive Syllogism (DS)
From p ∨ q and ¬p, infer q

Example:
- Either I'll study or I'll fail (p ∨ q)
- I'm not studying (¬p)
- Therefore, I'll fail (q)

#### Double Negation (DN)
From ¬¬p, infer p (and vice versa)

Example:
- It is not the case that it is not raining (¬¬p)
- Therefore, it is raining (p)

## De Morgan's Laws

These important laws show the relationship between negation and conjunction/disjunction:

1. ¬(p ∧ q) ≡ (¬p ∨ ¬q)
2. ¬(p ∨ q) ≡ (¬p ∧ ¬q)

Example:
"It's not true that both the sun is shining and it's warm"
≡ "Either the sun is not shining or it's not warm"

## Practice Problems

Let's verify De Morgan's first law using a truth table:

| p | q | p ∧ q | ¬(p ∧ q) | ¬p | ¬q | ¬p ∨ ¬q |
|---|---|-------|----------|----|----|---------|
| T | T | T     | F        | F  | F  | F       |
| T | F | F     | T        | F  | T  | T       |
| F | T | F     | T        | T  | F  | T       |
| F | F | F     | T        | T  | T  | T       |

Notice how the columns for ¬(p ∧ q) and (¬p ∨ ¬q) are identical, proving their logical equivalence.

## Key Takeaways

- Truth tables provide a mechanical method for determining validity
- Rules of inference allow us to construct valid proofs
- De Morgan's laws show how negation interacts with conjunction and disjunction
- Complex statements can be analyzed by breaking them down into components

Next week, we'll explore Boolean algebra and its relationship to propositional logic.`
    },
    {
      id: "homework-2",
      title: "Homework 2: Truth Tables and Elementary Proofs",
      content: `# Symbolic Logic - Homework 2
## Truth Tables and Elementary Proofs
**Total Points: 50**

### Part 1: Truth Tables (20 points)

Construct complete truth tables for the following expressions: (5 points each)

a) (p → q) ∧ ¬p
b) ¬(p ∨ q) ↔ (¬p ∧ ¬q)

### Part 2: Proofs (20 points)

Construct proofs for the following arguments using rules of inference. Show each step. (10 points each)

1. Prove: q from premises p → q, r → ¬p, r
2. Prove: ¬p from premises p → q, p → r, ¬q ∨ ¬r

### Part 3: Applications (10 points)

Express these arguments in symbolic form and determine their validity using either a truth table or proof: (5 points each)

1. "If it's sunny, I'll go to the beach. If I go to the beach, I'll get a sunburn. It's sunny. Therefore, I'll get a sunburn."

2. "Either the butler or the maid is guilty. The butler has an alibi. Therefore, the maid is guilty."

## Answer Key

### Part 1: Truth Tables (20 points)

#### a) (p → q) ∧ ¬p

| p | q | p → q | ¬p | (p → q) ∧ ¬p |
|---|---|-------|----|-----------| 
| T | T | T     | F  | F         |
| T | F | F     | F  | F         |
| F | T | T     | T  | T         |
| F | F | T     | T  | T         |

#### b) ¬(p ∨ q) ↔ (¬p ∧ ¬q)

| p | q | p ∨ q | ¬(p ∨ q) | ¬p | ¬q | ¬p ∧ ¬q | ¬(p ∨ q) ↔ (¬p ∧ ¬q) |
|---|---|-------|----------|----|----|---------|----------------------|
| T | T | T     | F        | F  | F  | F       | T                    |
| T | F | T     | F        | F  | T  | F       | T                    |
| F | T | T     | F        | T  | F  | F       | T                    |
| F | F | F     | T        | T  | T  | T       | T                    |

### Part 2: Proofs (20 points)

#### 1. Prove: q from premises p → q, r → ¬p, r

**Answer**:
1. p → q (premise)
2. r → ¬p (premise)
3. r (premise)
4. ¬p (from 2,3 by MP)
5. p → q (from 1)
6. q (from 4,5 by MT)

#### 2. Prove: ¬p from premises p → q, p → r, ¬q ∨ ¬r

**Answer**:
1. p → q (premise)
2. p → r (premise)
3. ¬q ∨ ¬r (premise)
4. Assume p (for reductio)
5. q (from 1,4 by MP)
6. r (from 2,4 by MP)
7. q ∧ r (from 5,6 by ∧I)
8. Contradiction with 3
9. Therefore, ¬p

### Part 3: Applications (10 points)

#### 1. "If it's sunny, I'll go to the beach. If I go to the beach, I'll get a sunburn. It's sunny. Therefore, I'll get a sunburn."

**Answer**:
- Let p = "It's sunny"
- Let q = "I'll go to the beach"
- Let r = "I'll get a sunburn"

Symbolic form: (p → q) ∧ (q → r) ∧ p ∴ r

**Proof**:
1. p → q (premise)
2. q → r (premise)
3. p (premise)
4. q (from 1,3 by MP)
5. r (from 2,4 by MP)

**Valid argument**

#### 2. "Either the butler or the maid is guilty. The butler has an alibi. Therefore, the maid is guilty."

**Answer**:
- Let b = "The butler is guilty"
- Let m = "The maid is guilty"

Symbolic form: (b ∨ m) ∧ ¬b ∴ m

This is a valid argument by disjunctive syllogism:
1. b ∨ m (premise)
2. ¬b (premise)
3. m (from 1,2 by DS)`
    },
    {
      id: "week-3",
      title: "Week 3: Boolean Algebra",
      content: `# Boolean Algebra

## Introduction to Boolean Algebra

Boolean algebra, developed by George Boole, is a mathematical structure dealing with operations on logical values.

It forms the foundation of digital circuit design and computer science.

## Basic Operations

### NOT (Complement)
Symbol: ¬ or '
- 0' = 1
- 1' = 0

### AND (Conjunction)
Symbol: ∧ or ⋅
- 1 ∧ 1 = 1
- 1 ∧ 0 = 0
- 0 ∧ 1 = 0
- 0 ∧ 0 = 0

### OR (Disjunction)
Symbol: ∨ or +
- 1 ∨ 1 = 1
- 1 ∨ 0 = 1
- 0 ∨ 1 = 1
- 0 ∨ 0 = 0

## Fundamental Laws of Boolean Algebra

### Identity Laws
- x ∨ 0 = x
- x ∧ 1 = x

### Null Laws
- x ∨ 1 = 1
- x ∧ 0 = 0

### Idempotent Laws
- x ∨ x = x
- x ∧ x = x

### Complement Laws
- x ∨ ¬x = 1
- x ∧ ¬x = 0

### Commutative Laws
- x ∨ y = y ∨ x
- x ∧ y = y ∧ x

### Associative Laws
- (x ∨ y) ∨ z = x ∨ (y ∨ z)
- (x ∧ y) ∧ z = x ∧ (y ∧ z)

### Distributive Laws
- x ∨ (y ∧ z) = (x ∨ y) ∧ (x ∨ z)
- x ∧ (y ∨ z) = (x ∧ y) ∨ (x ∧ z)

### De Morgan's Laws
- ¬(x ∨ y) = ¬x ∧ ¬y
- ¬(x ∧ y) = ¬x ∨ ¬y

## Boolean Functions and Truth Tables

Any boolean function can be represented as a truth table:

Example: f(x,y) = x ∧ (¬y)

| x | y | ¬y | x ∧ (¬y) |
|---|---|----|---------| 
| 0 | 0 | 1  | 0       |
| 0 | 1 | 0  | 0       |
| 1 | 0 | 1  | 1       |
| 1 | 1 | 0  | 0       |

## Boolean Expressions and Simplification

Boolean expressions can be simplified using the laws above.

**Example**: Simplify: (x ∧ y) ∨ (x ∧ ¬y) ∨ (¬x ∧ y)

**Step 1**: Factor out common terms
- (x ∧ y) ∨ (x ∧ ¬y) = x ∧ (y ∨ ¬y) = x (by complement law)
- So our expression is: x ∨ (¬x ∧ y)

**Step 2**: Use distributive law
- x ∨ (¬x ∧ y) = (x ∨ ¬x) ∧ (x ∨ y) = 1 ∧ (x ∨ y) = (x ∨ y)

## Applications in Digital Logic

Boolean algebra is fundamental to digital circuit design:

### AND Gate
- Two inputs (A and B) produce output A∧B
- Output is true only when both inputs are true

### OR Gate  
- Two inputs (A and B) produce output A∨B
- Output is true when at least one input is true

### NOT Gate
- Single input produces inverted output
- Output is opposite of input value

## Key Takeaways

- Boolean algebra provides a mathematical framework for logical operations
- The fundamental laws allow for systematic simplification of logical expressions
- Boolean functions can be represented using truth tables
- These concepts are essential for digital circuit design and computer science
- Simplification techniques help optimize logical expressions

Next week, we'll explore predicate logic and quantifiers.`
    }
  ]
};

// Function to get full document content for AI processing
export function getFullDocumentContent(): string {
  return bookContent.sections.map(section => 
    `${section.title}\n\n${section.content}`
  ).join('\n\n');
}