SIT796 Reinforcement Learning

MDPs and Dynamic Programming

Presented by: Dr. Thommen George Karimpanal School of Information Technology

<!-- image -->

## Week 2 Recap:

## The Problem

- * Each step you are faced with the same choice of actions.
- ¢ After choosing an action you end up in the same state but will have received a reward for the action taken
- -Positive, negative or zero
- — The reward is stochastic — we will assume a normal distribution, but any distributions can be studied
- * Your objective is to maximise your reward over a period of time.
- -— Can often focus on minimising regret instead.

## Examples

- * Slot machines — people often search for the 'luckiest' machine
- * Doctor finding the best medicine for your medical condition
- * Recommendation systems.
- ¢ Anomaly detection
- 2 So, which action should you choose?

<!-- image -->

<!-- image -->

<!-- image -->

## Week 2 recap: Basic MAB Algorithm

```
Initialise: for a = 1 tok Q(a) — 0 N(a) <0 Loop forever: argmaxQ(a) withprobability1—e (breaking ties randomly) a random Q(a) with probability ¢ R © bandit(A) N(A) — N(A) +1 Q(A) — QCA) + IR — Q(4)] N(A)
```

The above algorithm has five primary steps that are often replaced with different approaches.

- ¢ — Initialisation (prior to loop)
- ¢ — Action selection
- ¢ — Gather any reward (in full problem this will include getting the new state)
- ¢ Update step counter (or other internal parameter adjustments)
- * Update Q estimate (update new state to current state)

<!-- image -->

<!-- image -->

## Ontrack task: Value Calculation

- a) In Fig 1, what are the discounted and undiscounted values V,,(s) and V,,«(s)?

<!-- image -->

The red arrows represent the policy 7

Is the shown policy the optimal one 2*?

Discounted; set y = 0.9 Undiscounted; set y = 1

<!-- image -->

<!-- image -->

<!-- image -->

## Questions from workshop:

How to deal with continuous states and continuous actions?

<!-- image -->

## The Problem

Formally, the RL problem is formulated as a Markov Decision Process (MDP)

- * AnMODP is atuple M={S, A,J,y, R}
- — S§ -Theset of possible states
- — ATheset of actions the agent can take
- -— J -transition probabilities
- — y -The discount rate or the discount factor.
- -RAreward distribution function conditioned.

R=0

Rewa rd fu nction

<!-- image -->

Deakin University CRICOS Provider Code: 001138

Deterministic transition

<!-- image -->

Probabil istic transition

<!-- image -->

<!-- image -->

## Finite State Machine

Consider: When you press a button on your Spotify player to skip forward one song it combines the input you just entered with preceding events.

- ¢ Such as the selection of shuffle or repeat
- * Current playlist selected
- * Other music that matches your taste

Thus, a machine is a system that accepts input values, possibly produces outputs, and has an internal mechanism to track previous inputs/events

A Finite state machine is a graph representation

- ¢ A finite, directed, connected graph
- * Contains a set of states (graph nodes)
- ¢ Aset of inputs/actions (arcs)
- A state transition function, describing the effect of the inputs on the states

<!-- image -->

<!-- image -->

<!-- image -->

<!-- image -->

## Probabilistic Finite State Machine

<!-- image -->

A PFSM is a FSM where the next state function is a probability distribution over the full set of states of the machine.

- ¢ May contain a number of transitions for each input
- ¢ Each transition has a probability (0-1)
- ¢ The transitions for an input should add to 1
- ¢ The probability represents the random chance of selecting that path

## Example — Recycling Robot

## Background:

- * Robot must try and collect rubbish for recycling without running out of power.

## Problem

- ¢ Simplified problem assumes low level control is handled by other systems
- * Learn to collect rubbish only when the risk of running out of power is low.

## Defining an MDP — episodic

- * State —-Symbolic discrete states
- -Currently has 'high' or 'low' charge.
- * Actions — Produces a vector of actions (not a single action)
- -Wait — no chance of changing state, but smaller chance of getting a reward.
- Search for rubbish, when state is 'high' there is a 1 — a chance it will change to state 'low'.
- Search for rubbish, when state is 'low' there is a 1 — 6 chance battery will go flat.
- Recharge (only from state 'low') — transitions to state 'high', no reward
- * Rewards (positive and negative rewards)
- Small chance of finding a can when searching or waiting. Each can collected is a +1 reward.
- -A reward (penalty) of -3 if the robot needs rescuing as it ran out of power.

<!-- image -->

<!-- image -->

| search   |      |
|----------|------|
| search   |      |
| search   |      |
| search   |      |
| wait     |      |
| wait     |      |
| wait     |      |
| wait     |      |
| recharge | high |
| recharge |      |

## Markov Model

<!-- image -->

Named after Andrey Markov, a Markov Model is a stochastic model used to model randomly changing systems.

The same as a probabilistic finite state machine except it ignores the input values.

- ¢ In other words each transition is only labelled with a probability

Can be used to model a large number of natural phenomena and processes

<!-- image -->

## First-Order Markov Model (Markov Chain)

<!-- image -->

An Observable Markov Model is first-order if the probability of it being in the present state S, at any time t is a function only of its being in the previous state S;\_, at the time t — 1, where S, and S;\_, belong to the set of observable states S.

- ° For all states S; and S; we can say pj; = P(Sta1 = S;|St = S;) for alltime, t. These probabilities are assumed to be stationary.
- °¢ These probabilities create a transition probability matrix, eg matrix M below.
- ¢ Note, there are also second, third-order, ... Markov models that consider multiple nodes contribute to the transition probability.
- — While there is research into second-order approaches to RL — we will not consider them

As a First-Order Markov Model moves from one discrete node to the next based only on the previous node it is also referred to as a Markov Chain

|     |   S 0 |   S 1 |   S 2 |   S 3 |   Total |
|-----|-------|-------|-------|-------|---------|
| S 0 |   0.4 |   0.3 |   0.2 |   0.1 |       1 |
| S 1 |   0.2 |   0.3 |   0.2 |   0.3 |       1 |
| S 2 |   0.1 |   0.3 |   0.3 |   0.3 |       1 |
| S 3 |   0.2 |   0.3 |   0.3 |   0.2 |       1 |

## Partially Observable MDPs (POMDPs)

What if we can't know the state completely?

Eg: We see what looks like a tiger's tail, but the rest of the tiger is behind a wall

Can we say for sure that the state should contain 'Tiger'?

<!-- image -->

<!-- image -->

## Partially Observable MDPs (POMDPs)

## A POMDP is a tuple (S, A, O,P, R, Z,7)

- a S isa finite set of states
- a Ais a finite set of actions
- a O isa finite set of observations
- a P is a state transition probability matrix, Ps = P[St+i =s' | Se = 5, Ar = a]
- m R is a reward function, R2 = E[Rr+1 | St = 5, Ar = a]
- m 2 is an observation function, Jo = P[Ornr1 =0 | Stti = s', At = a]
- m ¥ is a discount factor y € [0, 1].

<!-- image -->

<!-- image -->

## Multi-Objective MDP (MOMDP)

An MDP provides a single scalar reward each time step indicating the success/failure of the agent.

- The objective of the agent is to maximise this reward — hence achieving its goal

However, many problems naturally have multiple conflicting objectives.

- Shoot down the enemy plane without being shot down yourself
- Release enough water to power the city but save some for future droughts
- Make as much profit as possible while release as little green house gases as possible

## A Multi-objective MDP (MOMDP) is an MDP except instead of a single reward

- * Has a vector of rewards — one for each objective

Instead of finding a single optimal policy it works on a set of pareto optimal policies Two main types of MORL Problems:

Single-policy MORL : aims to find a single policy on the front which is a good match to some pre-defined specifications

Multi-policy MORL aims to find a good approximation to this front

Solutions accurate (close to the actual front)

Solutions are well distributed along the front

Similar extent to the actual front

<!-- image -->

<!-- image -->

## Markov Model Cheat Sheet

| Markov Models                         | Markov Models   | Do we have control over the state transitions?   | Do we have control over the state transitions?   |
|---------------------------------------|-----------------|--------------------------------------------------|--------------------------------------------------|
|                                       |                 | No                                               | Yes                                              |
| Are the states completely observable? | Yes             | Markov Chain                                     | MDP (Markov Decision Process)                    |
|                                       | No              | HMM(Hidden Markov model)                         | POMDP (Partially observable MDP)                 |

<!-- image -->

## MIDP Types

| Basis               |                    |                      |
|---------------------|--------------------|----------------------|
| Horizon:            | Finite             | Infinite             |
| State Transitions:  | Deterministic      | Stochastic           |
| Terminal condition: | Episodic           | Continuous           |
| Discounting:        | Discounted ( 𝛾 <1) | Undiscounted ( 𝛾 =1) |
| Observability:      | Fully observable   | Partially observable |

<!-- image -->

SIT796 Reinforcement Learning

Dynamic Programming

Presented by: Dr. Thommen George Karimpanal School of Information Technology

<!-- image -->

## Dynamic Programming

. Developed by Richard Bellman (1950s)

"An interesting question is, "Where did the name, dynamic programming, come from?' The 1950s were not good years for mathematical research. We had a very interesting gentleman in Washington named Wilson. He was Secretary of Defense, and he actually had a pathological fear and hatred of the word, research. I'm not using the term lightly; I'm using it precisely. His face would suffuse, he would turn red, and he would get violent if people used the term, research, in his presence. You can imagine how he felt, then, about the term, mathematical. The RAND Corporation was employed by the Air Force, and the Air Force had Wilson as its boss, essentially. Hence, I felt I had to do something to shield Wilson and the Air Force from the fact that I was really doing mathematics inside the RAND Corporation. What title, what name, could I choose? In the first place I was interested in planning, in decision making, in thinking. But planning, is not a good word for various reasons. I decided therefore to use the word, 'programming.' I wanted to get across the idea that this was dynamic, this was multistage, this was time-varying—I thought, let's kill two birds with one stone. Let's take a word that has an absolutely precise meaning, namely dynamic, in the classical physical sense. It also has a very interesting property as an adjective, and that is it's impossible to use the word, dynamic, in a pejorative sense. Try thinking of some combination that will possibly give it a pejorative meaning. It's impossible. Thus, I thought dynamic programming was a good name. It was something not even a Congressman could object to. So I used it as an umbrella for my activities" (p. 159).

Source http://www.breves-de-maths.fr/richard-bellman-et-laprogrammation-dynamique/

<!-- image -->

<!-- image -->

Source:

## Dynamic Programming

What is Dynamic Programming?

Mathematical optimisation technique used to find optimal solutions to MDPs

It requires the availability of the perfect model of the system (i.e., full knowledge of the transition probabilities)

DP can be used to compute optimal value functions using "Bellman update equations'

<!-- image -->

## Dynamic Programming

<!-- formula-not-decoded -->

Consequences of . current action

The best it can do in the future

i

<!-- formula-not-decoded -->

<!-- image -->

## Policy Evaluation (Prediction)

<!-- image -->

We want to evaluate a given policy rm

<!-- formula-not-decoded -->

<!-- formula-not-decoded -->

<!-- formula-not-decoded -->

Iteratively applying this update will result in the value function

## Policy Evaluation (Prediction)

## Iterative Policy Evaluation, for estimating V ~ vu,

Input 7, the policy to be evaluated

Algorithm parameter: a small threshold 0 &gt; 0 determining accuracy of estimation Initialize V(s) arbitrarily, for s € 8, and V(terminal) to 0

Loop:

A+0

Loop for each s € 8:

v&lt;

V(s)

V(s)

A

&lt;

until A &lt; 6

—

Yo, tals)

max(A,

5),

(8,718, a)

[7

+

V(s')]

|v

—

V(s)|)

<!-- image -->

<!-- formula-not-decoded -->

<!-- image -->

## Policy Improvement

- Now we know how good it is to follow the current policy from states U7(s)

Would it be better to change to a new policy from s?

One way to find out: Choose « #7(s) and then continue following the original policy

<!-- formula-not-decoded -->

The new policy 7' is better if: qx (8,7'(s)) &gt; Ux(s)

Comes from the Policy Improvement Theorem

<!-- image -->

## Policy Improvement (Example)

<!-- image -->

<!-- image -->

<!-- image -->

<!-- image -->

| Uk for the random policy                  | greedy policy w.rt. UR               |
|-------------------------------------------|--------------------------------------|
|                                           | HPP Kee PP] EPP PP] PP random policy |
| P2al29}-30b-29 [23)-s0)29}-24             |                                      |
| -8.4]-8.4|-7.7]-6.1] -9.0]-8.4]-6.1] 0.0] | optimal policy                       |

<!-- image -->

## Policy Iteration

Evaluate policy, then improve, then evaluate again and then improve again ...... till convergence!

Disadvantage: Requires policy evaluation loop

- . Initialization

V(s) € Rand z(s) € A(s) arbitrarily for all s € 8; V(terminal) = 0

. Policy Evaluation Loop: A+0 Loop for each s € 8: v «+ V(s) V(s) — Dy, p(s', 718, 7(8)) [7 + V(8')] A + max(A, |v — V(s)|) until A &lt; @ (a small positive number determining the accuracy of estimation)

- . Policy Improvement policy-stable — true For each s € 8:
- old-action + 7(s) m(s) + argmax, &gt;), p(s',7|8,a)[r + yV(s')] If old-action £ x(s), then policy-stable — false

If policy-stable, then stop and return V * v, and 7 * 7,; else go to 2

<!-- image -->

## Value Iteration

The Bellman optimality eq. is turned into an update rule.

Evaluates and improves policy simultaneously

Converges faster than policy iteration.

<!-- image -->

## Value Iteration, for estimating 7

Algorithm parameter: a small threshold @ &gt; 0 determining accuracy of estimation Initialize V(s), for all s € 8*, arbitrarily except that V(terminal) = 0

Loop:

```
| AO Loop for each s € 8: v + V(s) V(s) + maxa >>, p(s', r|s,a)[r + WV(s')] A + max(A, |v — V(s)]) until A <0
```

Output a deterministic policy, 7 + 7,, such that m(s) = argmax, &gt;&gt;, , p(s', 7| 5, a) [r + V(s')|

## Generalized Policy Iteration

When does evaluation stabilise?

When does improvement stabilise?

If both stabilise, then the value function and policy must have converged (optimum)

<!-- image -->

<!-- image -->

<!-- image -->

## DP disadvantages?

Not suitable for very large problems

No. of states grows exponentially with no. of state variables — Curse of Dimensionality!

Requires sweep over entire state space — Asynchronous DP is a solution

<!-- formula-not-decoded -->

It requires a model of the system — RL does not need a model in general

Bootstrapping — updating an estimate based on another estimate -errors can add up!

<!-- image -->

## Readings

This lecture focused on the MDPs, Finite state machines and Dynamic programming.

- ¢ Ensure you understand what was discussed here before moving to the subsequent topics

For more detailed information see Sutton and Barto (2018) Reinforcement Learning: An Introduction

- * Chapter 3: Finite Markov Decision Processes
- ° http://incompleteideas.net/book/RLbook2020.pdf

<!-- image -->

<!-- image -->