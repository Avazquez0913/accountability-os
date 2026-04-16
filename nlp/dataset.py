# dataset.py
# Synthetic claim-evidence dataset for NLP pipeline evaluation.
# 50 pairs total: 25 matching (label=1), 25 non-matching (label=0).
# Used for training baseline comparisons and evaluating verify.py.

import pandas as pd

PAIRS = [
    # ── MATCHING PAIRS (label = 1) ────────────────────────────────────────────
    # LeetCode / algorithms
    {
        "claim": "I solved a dynamic programming problem on LeetCode today",
        "evidence": "Worked through LeetCode 322 Coin Change using bottom-up dynamic programming. Built a DP table tracking minimum coins needed for each amount up to the target.",
        "label": 1
    },
    {
        "claim": "I studied BFS and DFS graph algorithms",
        "evidence": "Implemented BFS and DFS from scratch in Python. Solved LeetCode 200 Number of Islands using BFS with a visited set to avoid revisiting nodes.",
        "label": 1
    },
    {
        "claim": "I practiced binary search problems on LeetCode",
        "evidence": "Solved three binary search problems today: Search in Rotated Array, Find Peak Element, and Koko Eating Bananas. Got two correct on first submission.",
        "label": 1
    },
    {
        "claim": "I studied recursion and backtracking",
        "evidence": "Worked through the N-Queens problem using recursive backtracking. Traced the call stack manually to understand how the algorithm explores and prunes branches.",
        "label": 1
    },
    {
        "claim": "I completed a sliding window algorithm problem",
        "evidence": "Solved Longest Substring Without Repeating Characters using a sliding window approach. Used a hash set to track characters in the current window.",
        "label": 1
    },
    # Workout / fitness
    {
        "claim": "I completed a full body workout today",
        "evidence": "Did 4 sets of squats, 3 sets of bench press, and 3 sets of deadlifts. Finished with 20 minutes of cardio on the treadmill. Total session was 75 minutes.",
        "label": 1
    },
    {
        "claim": "I went for a run this morning",
        "evidence": "Ran 5km in 28 minutes at the park. Kept my heart rate around 155 bpm. Stretched for 10 minutes afterward to prevent soreness.",
        "label": 1
    },
    {
        "claim": "I did a HIIT workout session",
        "evidence": "Completed a 30-minute HIIT circuit: 40 seconds on, 20 seconds rest. Exercises included burpees, jump squats, mountain climbers, and push-ups. Three full rounds.",
        "label": 1
    },
    {
        "claim": "I completed a yoga and stretching session",
        "evidence": "Followed a 45-minute yoga flow focusing on hip flexors and hamstrings. Held each pose for 30-60 seconds and finished with 10 minutes of meditation.",
        "label": 1
    },
    {
        "claim": "I did an upper body strength training session",
        "evidence": "Trained chest and shoulders today. Did incline dumbbell press, lateral raises, cable flyes, and overhead press. Increased weight on shoulder press by 5 lbs.",
        "label": 1
    },
    # Reading / studying
    {
        "claim": "I read a chapter on machine learning today",
        "evidence": "Read chapter 4 of Hands-On Machine Learning covering gradient descent optimization. Took notes on learning rate schedules and momentum. Worked through two exercises.",
        "label": 1
    },
    {
        "claim": "I studied system design concepts",
        "evidence": "Read about distributed systems, covering load balancing, consistent hashing, and CAP theorem. Drew architecture diagrams for a URL shortener and a chat system.",
        "label": 1
    },
    {
        "claim": "I read articles about natural language processing",
        "evidence": "Went through three papers on transformer architectures and attention mechanisms. Summarized key points about how BERT handles bidirectional context in language models.",
        "label": 1
    },
    {
        "claim": "I studied data structures by reading a textbook",
        "evidence": "Covered chapter 7 on hash tables: open addressing, chaining, and load factor analysis. Implemented a simple hash map in Python from scratch as a follow-up exercise.",
        "label": 1
    },
    {
        "claim": "I read a chapter on operating systems",
        "evidence": "Studied process scheduling algorithms in the OS textbook: FCFS, SJF, Round Robin, and Priority Scheduling. Compared turnaround times using example Gantt charts.",
        "label": 1
    },
    # Job applications
    {
        "claim": "I applied to software engineering jobs today",
        "evidence": "Submitted applications to three companies: Google, Stripe, and a Series B startup. Tailored my resume for each role and wrote custom cover letters highlighting relevant projects.",
        "label": 1
    },
    {
        "claim": "I updated my resume and applied to jobs",
        "evidence": "Rewrote the experience section of my resume to quantify impact with metrics. Applied to two backend engineering roles and one full-stack position on LinkedIn and their career pages.",
        "label": 1
    },
    {
        "claim": "I did a mock technical interview today",
        "evidence": "Practiced a 45-minute mock interview with a friend. Got two coding questions: reverse a linked list and find all permutations of a string. Talked through my approach before coding.",
        "label": 1
    },
    {
        "claim": "I researched companies and applied to internships",
        "evidence": "Looked into five companies' engineering blogs to understand their tech stacks. Applied to two SWE internships at fintech companies and one at a healthtech startup.",
        "label": 1
    },
    {
        "claim": "I prepared for a behavioral interview",
        "evidence": "Wrote out STAR-format answers for the top 10 behavioral questions. Practiced telling stories about conflict resolution, leadership, and handling ambiguity. Recorded myself for review.",
        "label": 1
    },
    # GitHub commits
    {
        "claim": "I pushed code to GitHub today",
        "evidence": "Committed and pushed three changes to my accountability-os repo: fixed a Redis parsing bug, added the weekly summary endpoint, and updated the mobile app to display live scores.",
        "label": 1
    },
    {
        "claim": "I made a GitHub commit working on a side project",
        "evidence": "Pushed a commit to my portfolio site repo. Added a new projects section, fixed a responsive layout bug on mobile, and updated the README with setup instructions.",
        "label": 1
    },
    {
        "claim": "I contributed to an open source project today",
        "evidence": "Opened a pull request on a popular Python library fixing a documentation error and adding a missing type hint to one of the utility functions. PR was reviewed and merged.",
        "label": 1
    },
    {
        "claim": "I refactored my codebase and pushed changes",
        "evidence": "Spent 2 hours refactoring the activity manager module: extracted repeated Redis parsing logic into a helper, added JSDoc comments, and split a large function into smaller ones.",
        "label": 1
    },
    {
        "claim": "I implemented a new feature and pushed it to GitHub",
        "evidence": "Built and shipped the manual activity logging endpoint. Added input validation, connected it to the scoring system, and wrote a test script to verify it worked end to end.",
        "label": 1
    },

    # ── NON-MATCHING PAIRS (label = 0) ────────────────────────────────────────
    {
        "claim": "I solved a dynamic programming problem on LeetCode today",
        "evidence": "Spent the afternoon watching a cooking show and meal prepping for the week. Made pasta, roasted vegetables, and prepared overnight oats for breakfast.",
        "label": 0
    },
    {
        "claim": "I studied BFS and DFS graph algorithms",
        "evidence": "Went to the grocery store and ran errands. Picked up coffee, cleaned the apartment, and did two loads of laundry. Pretty relaxing Sunday overall.",
        "label": 0
    },
    {
        "claim": "I completed a full body workout today",
        "evidence": "Had a long video call with my family and watched the game in the evening. Ordered pizza and relaxed on the couch most of the day.",
        "label": 0
    },
    {
        "claim": "I went for a run this morning",
        "evidence": "Stayed in bed and scrolled through social media for a while. Eventually got up to make breakfast but didn't leave the house at all today.",
        "label": 0
    },
    {
        "claim": "I read a chapter on machine learning today",
        "evidence": "Binge-watched a new series on Netflix. Finished six episodes and ordered delivery for dinner. Didn't open a single book or study resource.",
        "label": 0
    },
    {
        "claim": "I applied to software engineering jobs today",
        "evidence": "Played video games online with friends for most of the day. Did some browsing but nothing productive. Will apply to jobs tomorrow for sure.",
        "label": 0
    },
    {
        "claim": "I pushed code to GitHub today",
        "evidence": "Took a nap after lunch and spent the evening journaling. No screen time, no coding. Intentional rest day to recharge before a busy week.",
        "label": 0
    },
    {
        "claim": "I practiced binary search problems on LeetCode",
        "evidence": "Organized my room and reorganized my bookshelf alphabetically. Had coffee with a friend and caught up on news articles. Not a very technical day.",
        "label": 0
    },
    {
        "claim": "I completed a yoga and stretching session",
        "evidence": "Spent the morning debugging a complex concurrency issue at work. Long meetings in the afternoon. Too tired by evening to exercise.",
        "label": 0
    },
    {
        "claim": "I studied system design concepts",
        "evidence": "Cooked a new recipe for dinner and watched cooking videos on YouTube. Learned about knife techniques and flavor pairing but nothing related to software.",
        "label": 0
    },
    {
        "claim": "I did a HIIT workout session",
        "evidence": "Had back-to-back work meetings all day. Ate lunch at my desk. By the time I finished work it was already 8pm and I was too exhausted to exercise.",
        "label": 0
    },
    {
        "claim": "I updated my resume and applied to jobs",
        "evidence": "Spent the day hiking with friends in the mountains. Great views, good weather. Completely unplugged — no phone, no laptop, no career stuff.",
        "label": 0
    },
    {
        "claim": "I read articles about natural language processing",
        "evidence": "Browsed Reddit and Twitter most of the morning. Watched a few YouTube videos about travel destinations. Nothing academic or technical was consumed today.",
        "label": 0
    },
    {
        "claim": "I did an upper body strength training session",
        "evidence": "Attended a birthday party and spent the evening socializing. Had cake and drinks. Fun night but no physical activity beyond walking around the venue.",
        "label": 0
    },
    {
        "claim": "I made a GitHub commit working on a side project",
        "evidence": "Spent the day at a museum exhibit on ancient history. Very interesting but completely unrelated to coding. No computer opened all day.",
        "label": 0
    },
    {
        "claim": "I studied recursion and backtracking",
        "evidence": "Did some light reading of fiction novels and listened to podcasts about personal finance. Relaxing day with no technical studying involved.",
        "label": 0
    },
    {
        "claim": "I did a mock technical interview today",
        "evidence": "Went to the beach with family. Swam in the ocean, played volleyball, and had a barbecue in the evening. A great day but not productive for job prep.",
        "label": 0
    },
    {
        "claim": "I completed a sliding window algorithm problem",
        "evidence": "Watched a documentary about space exploration and took a long walk in the afternoon. Thought about life and future goals but did no programming today.",
        "label": 0
    },
    {
        "claim": "I studied data structures by reading a textbook",
        "evidence": "Spent the afternoon at a coffee shop chatting with colleagues. Discussed weekend plans and current events. Did not bring any study materials.",
        "label": 0
    },
    {
        "claim": "I contributed to an open source project today",
        "evidence": "Took a half day off work. Got a haircut, went to the dentist, and ran a few other errands around town. No coding or open source work.",
        "label": 0
    },
    {
        "claim": "I refactored my codebase and pushed changes",
        "evidence": "Had a movie marathon at home — watched three films back to back. Made popcorn and completely checked out from work and side projects for the day.",
        "label": 0
    },
    {
        "claim": "I implemented a new feature and pushed it to GitHub",
        "evidence": "Spent the evening cooking an elaborate dinner from scratch and hosting friends. Cleaned up afterward and went to bed early. No programming happened.",
        "label": 0
    },
    {
        "claim": "I researched companies and applied to internships",
        "evidence": "Did some gardening and yard work in the morning. Repotted plants and mowed the lawn. Rewarding but had nothing to do with job searching.",
        "label": 0
    },
    {
        "claim": "I prepared for a behavioral interview",
        "evidence": "Played board games with roommates all evening. Had a great time but spent no time on interview prep, resume work, or anything career-related.",
        "label": 0
    },
    {
        "claim": "I studied operating systems concepts",
        "evidence": "Went to a concert in the evening and grabbed dinner before the show. Long commute back. Got home late and went straight to sleep.",
        "label": 0
    },
]


def load_dataset() -> pd.DataFrame:
    """Return the full dataset as a pandas DataFrame."""
    return pd.DataFrame(PAIRS)


if __name__ == '__main__':
    df = load_dataset()
    print(f"Total pairs: {len(df)}")
    print(f"Matching (label=1): {df['label'].sum()}")
    print(f"Non-matching (label=0): {(df['label'] == 0).sum()}")
    print(df.head(3))
