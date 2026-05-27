from sqlalchemy.orm import Session

from app.models import Lesson, Quiz, QuizAttempt


def generate_quiz(db: Session, lesson: Lesson) -> Quiz:
    topic = lesson.title
    questions = [
        {
            "prompt": f"What is the main idea of {topic}?",
            "question_type": "multiple_choice",
            "options": [
                "To memorize syntax without context",
                "To understand and apply the concept in code",
                "To skip debugging",
                "To avoid writing examples",
            ],
            "correct_answer": "To understand and apply the concept in code",
            "explanation": "The platform focuses on practical understanding, examples, and feedback.",
        },
        {
            "prompt": f"Write a short example or explanation that uses {topic}.",
            "question_type": "short_answer",
            "options": [],
            "correct_answer": "Answers should include the concept and a realistic programming use case.",
            "explanation": "Short-answer responses are reviewed for concept coverage and clarity.",
        },
    ]
    quiz = Quiz(lesson_id=lesson.id, title=f"{topic} Practice Quiz", questions=questions)
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz


def grade_attempt(db: Session, quiz: Quiz, student_id: int, answers: dict) -> QuizAttempt:
    questions = quiz.questions
    correct = 0
    for index, question in enumerate(questions):
        answer = str(answers.get(str(index), "")).strip().lower()
        expected = str(question.get("correct_answer", "")).strip().lower()
        if question.get("question_type") == "short_answer":
            correct += 1 if len(answer.split()) >= 8 else 0
        elif answer == expected:
            correct += 1
    score = round((correct / max(len(questions), 1)) * 100, 2)
    feedback = "Great work. Keep practicing with voice explanations." if score >= 70 else "Review the lesson summary and ask the assistant for another example."
    attempt = QuizAttempt(quiz_id=quiz.id, student_id=student_id, score=score, answers=answers, feedback=feedback)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt
