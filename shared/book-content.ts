import type { BookContent } from "./schema";

export const bookContent: BookContent = {
  title: "Introduction to Symbolic Logic",
  author: "J.-M. Kuczynski PhD",
  sections: [
    {
      id: "week-1",
      title: "Week 1: Basic Concepts, Notation, and Logical Operators",
      content: `Introduction to Logic

Logic is the study of valid reasoning. In this course, we'll focus on symbolic logic, which uses special symbols and precise rules to analyze and evaluate arguments. Unlike informal logic, symbolic logic gives us tools to determine validity with mathematical precision.

Basic Concepts

Statement (Proposition): A sentence that is either true or false, but not both
Argument: A sequence of statements where one (the conclusion) is claimed to follow from the others (the premises)
Validity: An argument is valid if it's impossible for all premises to be true while the conclusion is false
Soundness: A valid argument with true premises

Basic Logical Symbols

Negation (¬): "not"
Example: If p = "It is raining" Then ¬p = "It is not raining"

Conjunction (∧): "and"
Example: If p = "It is cold" and q = "It is windy" Then p ∧ q = "It is cold and windy"

Disjunction (∨): "or"
Example: If p = "I will study" and q = "I will fail" Then p ∨ q = "I will study or I will fail"

Conditional (→): "if...then"
Example: If p = "It rains" and q = "The ground is wet" Then p → q = "If it rains, then the ground is wet"

Material vs. Strict Implication

Material Implication (→): Truth-functional: defined purely by truth values. False only when antecedent is true and consequent is false. Example: "If it rains, then the ground is wet"

Strict Implication (⊃): Modal: involves necessary connection. Example: "If x is a bachelor, then x is unmarried". Represents logical necessity rather than mere material implication.

Translation Practice

From English to Symbolic Notation:
- "It's not both sunny and warm" → ¬(p ∧ q)
- "Either I'll go to the party or I'll stay home and study" → p ∨ (q ∧ r)

From Symbolic Notation to English:
- p → (q ∨ r) → "If it rains, then I'll either take an umbrella or stay inside"

Key Takeaways

- Symbolic logic provides precise tools for analyzing arguments
- Basic operators (¬, ∧, ∨, →) can combine to express complex statements
- Translation between natural language and logical notation requires careful attention to meaning
- Material implication differs from strict implication in important ways`
    },
    {
      id: "homework-1",
      title: "Homework 1: Basic Concepts and Notation",
      content: `Part 1: Translation (20 points)

Translate the following English statements into symbolic logic notation.

Let: p = "It rains", q = "The streets are wet", r = "People use umbrellas", s = "Traffic slows down"

1. "If it rains, then the streets are wet and people use umbrellas." (5 points)
2. "Either traffic slows down or it's not raining." (5 points)
3. "It's not true that when it rains, traffic slows down." (5 points)
4. "If the streets are wet and people use umbrellas, then it must be raining." (5 points)

Part 2: Symbolization (20 points)

Create appropriate symbols and translate these statements into logical notation:

1. "If John studies and gets tutoring, then he will pass the class. John studies and gets tutoring. Therefore, John will pass the class." (10 points)

2. "Either Mary goes to the gym or she goes for a run, but not both. If she goes for a run, she will be tired." (10 points)

Part 3: Analysis (10 points)

Explain the difference between material implication and strict implication using an example of each. (10 points)`
    },
    {
      id: "week-2",
      title: "Week 2: Truth Tables and Elementary Proofs",
      content: `The Propositional Calculus

Propositional calculus is a formal system for representing and analyzing logical relationships between propositions. It provides rules for constructing well-formed formulas, evaluating truth values, and making valid inferences.

Truth Tables

Truth tables systematically show all possible truth value combinations for propositional statements.

Basic Truth Tables:

Negation (¬)
| p | ¬p |
| T | F  |
| F | T  |

Conjunction (∧)
| p | q | p ∧ q |
| T | T | T     |
| T | F | F     |
| F | T | F     |
| F | F | F     |

Disjunction (∨)
| p | q | p ∨ q |
| T | T | T     |
| T | F | T     |
| F | T | T     |
| F | F | F     |

Conditional (→)
| p | q | p → q |
| T | T | T     |
| T | F | F     |
| F | T | T     |
| F | F | T     |

Elementary Proofs

Proofs in propositional logic use rules of inference to derive conclusions from premises.

Key Rules of Inference:

Modus Ponens (MP): From p → q and p, infer q
Modus Tollens (MT): From p → q and ¬q, infer ¬p
Disjunctive Syllogism (DS): From p ∨ q and ¬p, infer q
Double Negation (DN): From ¬¬p, infer p (and vice versa)

De Morgan's Laws

These important laws show the relationship between negation and conjunction/disjunction:
1. ¬(p ∧ q) ≡ (¬p ∨ ¬q)
2. ¬(p ∨ q) ≡ (¬p ∧ ¬q)

Example: "It's not true that both the sun is shining and it's warm" ≡ "Either the sun is not shining or it's not warm"

Key Takeaways

- Truth tables provide a mechanical method for determining validity
- Rules of inference allow us to construct valid proofs
- De Morgan's laws show how negation interacts with conjunction and disjunction
- Complex statements can be analyzed by breaking them down into components`
    },
    {
      id: "week-3",
      title: "Week 3: Boolean Algebra",
      content: `Introduction to Boolean Algebra

Boolean algebra, developed by George Boole, is a mathematical structure dealing with operations on logical values. It forms the foundation of digital circuit design and computer science.

Basic Operations

NOT (Complement): Symbol: ¬ or '
- 0' = 1
- 1' = 0

AND (Conjunction): Symbol: ∧ or ⋅
- 1 ∧ 1 = 1
- 1 ∧ 0 = 0
- 0 ∧ 1 = 0
- 0 ∧ 0 = 0

OR (Disjunction): Symbol: ∨ or +
- 1 ∨ 1 = 1
- 1 ∨ 0 = 1
- 0 ∨ 1 = 1
- 0 ∨ 0 = 0

Fundamental Laws of Boolean Algebra

Identity Laws:
- x ∨ 0 = x
- x ∧ 1 = x

Null Laws:
- x ∨ 1 = 1
- x ∧ 0 = 0

Idempotent Laws:
- x ∨ x = x
- x ∧ x = x

Complement Laws:
- x ∨ ¬x = 1
- x ∧ ¬x = 0

Commutative Laws:
- x ∨ y = y ∨ x
- x ∧ y = y ∧ x

Associative Laws:
- (x ∨ y) ∨ z = x ∨ (y ∨ z)
- (x ∧ y) ∧ z = x ∧ (y ∧ z)

Distributive Laws:
- x ∨ (y ∧ z) = (x ∨ y) ∧ (x ∨ z)
- x ∧ (y ∨ z) = (x ∧ y) ∨ (x ∧ z)

De Morgan's Laws:
- ¬(x ∨ y) = ¬x ∧ ¬y
- ¬(x ∧ y) = ¬x ∨ ¬y

Applications in Digital Logic

Boolean algebra is fundamental to digital circuit design, providing the mathematical foundation for AND gates, OR gates, and NOT gates that form the basis of all digital computers.`
    },
    {
      id: "week-4",
      title: "Week 4: Predicate Logic and Quantifiers",
      content: `Introduction to Predicate Logic

Predicate logic extends propositional logic by introducing predicates, individual constants, variables, and quantifiers. This allows us to express more complex relationships and make statements about collections of objects.

Basic Components

Predicates: Properties or relations that can be applied to objects
- P(x): "x has property P"
- R(x,y): "x has relationship R to y"

Individual Constants: Specific objects in our domain
- a, b, c represent particular individuals

Variables: Placeholders for objects in our domain
- x, y, z can represent any individual

Quantifiers

Universal Quantifier (∀): "for all" or "every"
- ∀x P(x): "For all x, P(x)" or "Everything has property P"

Existential Quantifier (∃): "there exists" or "some"
- ∃x P(x): "There exists an x such that P(x)" or "Something has property P"

Translation Examples

"All birds can fly" → ∀x (Bird(x) → CanFly(x))
"Some students are smart" → ∃x (Student(x) ∧ Smart(x))
"No cats are dogs" → ∀x (Cat(x) → ¬Dog(x))
"Someone loves everyone" → ∃x ∀y Love(x,y)

Quantifier Scope and Binding

The scope of a quantifier determines which variables it binds. Variables within the scope of a quantifier are bound; those outside are free.

Example: ∀x (P(x) → ∃y R(x,y))
- x is bound by the universal quantifier
- y is bound by the existential quantifier

Quantifier Relationships

Negation of Quantifiers:
- ¬∀x P(x) ≡ ∃x ¬P(x)
- ¬∃x P(x) ≡ ∀x ¬P(x)

Multiple Quantifiers:
The order of quantifiers matters!
- ∀x ∃y Love(x,y): "Everyone loves someone"
- ∃y ∀x Love(x,y): "Someone is loved by everyone"

Key Takeaways

- Predicate logic allows us to express relationships between objects
- Quantifiers let us make statements about collections
- Proper understanding of scope and binding is crucial
- The order of quantifiers significantly affects meaning`
    },
    {
      id: "week-5",
      title: "Week 5: Formal Proofs in Predicate Logic",
      content: `Natural Deduction in Predicate Logic

Natural deduction provides a systematic method for constructing formal proofs in predicate logic. We extend our propositional rules with new rules for quantifiers.

Universal Quantifier Rules

Universal Instantiation (UI):
From ∀x P(x), infer P(a) for any individual a

Universal Generalization (UG):
From P(a) where a is arbitrary, infer ∀x P(x)

Existential Quantifier Rules

Existential Instantiation (EI):
From ∃x P(x), infer P(a) for a new individual a

Existential Generalization (EG):
From P(a), infer ∃x P(x)

Proof Strategies

Direct Proof: Assume premises and derive conclusion using rules of inference
Indirect Proof: Assume negation of conclusion and derive contradiction
Conditional Proof: To prove P → Q, assume P and derive Q

Example Proof

Prove: ∀x (P(x) → Q(x)), ∀x P(x) ⊢ ∀x Q(x)

1. ∀x (P(x) → Q(x))    Premise
2. ∀x P(x)             Premise
3. P(a) → Q(a)         UI from 1
4. P(a)                UI from 2
5. Q(a)                MP from 3,4
6. ∀x Q(x)             UG from 5

Common Proof Techniques

Identity and Equality:
- Reflexivity: a = a
- Symmetry: if a = b, then b = a
- Transitivity: if a = b and b = c, then a = c
- Substitution: if a = b and P(a), then P(b)

Proof by Cases:
When dealing with disjunctions, prove each case separately

Mathematical Induction:
For properties over natural numbers, prove base case and inductive step

Key Takeaways

- Natural deduction provides systematic proof construction
- Quantifier rules must be applied carefully with proper restrictions
- Multiple proof strategies are available for different situations
- Formal proofs ensure absolute certainty in logical reasoning`
    },
    {
      id: "week-6",
      title: "Week 6: Models and Proof Theory",
      content: `Introduction to Models

A model is a mathematical structure that interprets the symbols of our logical language. Models help us understand the meaning of logical formulas and provide a way to prove invalidity and consistency.

Components of a Model M

Universe/Domain (|M|): The set of objects we're talking about
Interpretation function (I): Assigns meaning to predicates and constants
Variable assignment (v): Maps variables to objects in the domain

Using Models to Prove Invalidity

To prove an argument invalid, we need to find a model where:
- All premises are true
- The conclusion is false

One counterexample is sufficient to prove invalidity.

Example: Proving Invalidity
Argument: ∀x(P(x) → Q(x)), ∃xP(x) ⊢ ∀xQ(x)

Countermodel:
- Domain = {a, b}
- P = {a}
- Q = {a}

Analysis:
- ∀x(P(x) → Q(x)) is true (vacuously true for b)
- ∃xP(x) is true (because P(a) is true)
- ∀xQ(x) is false (because Q(b) is false)

Therefore, the argument is invalid.

Consistency Proofs

A set of sentences is consistent if there exists a model satisfying all sentences. To prove consistency, we construct a model that makes all sentences true.

Example: Proving Consistency
Sentences:
1. ∀x∃yR(x,y)
2. ∀x¬R(x,x)
3. ∀x∀y∀z((R(x,y) ∧ R(y,z)) → R(x,z))

Model:
- Domain = {1, 2, 3}
- R = {(1,2), (2,3), (1,3)}

Verification:
- Each x has a y it relates to (satisfies 1)
- No element relates to itself (satisfies 2)
- Transitivity holds (satisfies 3)

Model Construction Strategies

1. Start with the smallest possible domain
2. Add elements only as needed
3. Use diagrams or tables for relations
4. Check all required properties systematically

Advanced Applications

Independence Proofs: Show an axiom is not derivable from others by constructing two models - one satisfying all axioms, another satisfying all but the target axiom.

Categoricity: When all models of a theory are isomorphic, the theory is categorical.

Key Takeaways

- Models provide semantic interpretation for logical formulas
- Countermodels prove invalidity efficiently
- Consistency is established by model construction
- Model theory connects syntax with semantics in logic`
    }
  ]
};

export function getFullDocumentContent(): string {
  return bookContent.sections
    .map(section => `${section.title}\n\n${section.content}`)
    .join('\n\n');
}