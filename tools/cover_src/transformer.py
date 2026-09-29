"""A still in the style of 3Blue1Brown's transformer chapters: the words of a
sentence become embedding vectors, attention links them, and the vectors flow
up through an attention block and a multilayer perceptron. The attention
pattern on the right shows each word's weights over the words before it.

    manim -qh -s transformer.py TransformerBlock
"""
import numpy as np
from manim import *

WORDS = ["a", "prism", "splits", "white", "light"]
LINKS = [(0, 1, 0.5), (1, 2, 0.9), (3, 4, 1.0), (1, 4, 0.75), (2, 4, 0.45), (0, 4, 0.2)]
PATTERN = np.array([  # row = query word, column = key word; causal, rows sum to 1
    [1.00, 0, 0, 0, 0],
    [0.35, 0.65, 0, 0, 0],
    [0.10, 0.62, 0.28, 0, 0],
    [0.05, 0.20, 0.15, 0.60, 0],
    [0.04, 0.34, 0.14, 0.40, 0.08],
])


class TransformerBlock(Scene):
    def construct(self):
        self.camera.background_color = "#0b0b10"
        rng = np.random.default_rng(3)

        vectors = VGroup()
        for _ in WORDS:
            vals = rng.normal(0, 1.8, 6).round(1)
            vec = DecimalMatrix(vals.reshape(-1, 1), element_to_mobject_config={"num_decimal_places": 1})
            for entry, v in zip(vec.get_entries(), vals):
                entry.set_color(interpolate_color(RED_C, BLUE_C, np.clip((v + 3) / 6, 0, 1)))
            vectors.add(vec)
        vectors.scale(0.5).arrange(RIGHT, buff=0.62).move_to([-2.6, -1.75, 0])
        words = VGroup(*[Tex(w, color=GREY_B).scale(0.8).next_to(v, DOWN, buff=0.28)
                         for w, v in zip(WORDS, vectors)])

        arcs = VGroup()
        for i, j, w in LINKS:
            a, b = vectors[i].get_top() + UP * 0.1, vectors[j].get_top() + UP * 0.1
            arc = ArcBetweenPoints(a, b, angle=-PI / 2.2)
            arcs.add(arc.set_stroke(YELLOW_D, width=1.5 + 7 * w, opacity=0.25 + 0.7 * w))

        attn = RoundedRectangle(width=vectors.width + 0.9, height=0.82, corner_radius=0.2)
        attn.set_fill("#1d1d27", 1).set_stroke(GREY_B, 1.6).move_to([vectors.get_x(), 0.95, 0])
        mlp = attn.copy().move_to([vectors.get_x(), 2.55, 0])
        blocks = VGroup(Tex("Attention").scale(0.95).move_to(attn),
                        Tex("Multilayer Perceptron").scale(0.95).move_to(mlp))
        flow = VGroup(*[
            Arrow(attn.get_top(), mlp.get_bottom(), buff=0.1, stroke_width=3,
                  max_tip_length_to_length_ratio=0.3, color=GREY_C).set_x(v.get_x())
            for v in vectors
        ])

        formula = MathTex(r"\mathrm{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d_k}}\right)V", color=GREY_A)
        formula.scale(0.8).move_to([4.55, 2.55, 0])

        cell = 0.44
        dots = VGroup()
        for r in range(5):
            for c in range(5):
                w = PATTERN[r, c]
                pos = np.array([4.45 + (c - 2) * cell, -0.95 - (r - 2) * cell, 0])
                box = Square(cell, stroke_color=GREY_D, stroke_width=1).move_to(pos)
                dots.add(box)
                if w > 0:
                    dots.add(Dot(pos, radius=0.2 * np.sqrt(w), color=interpolate_color(GREY_B, WHITE, w)))
        keys = VGroup(*[Tex(w, color=GREY_B).scale(0.42).rotate(PI / 4)
                        .next_to(dots[0], UP, buff=0.12).set_x(4.45 + (i - 2) * cell)
                        for i, w in enumerate(WORDS)])
        queries = VGroup(*[Tex(w, color=GREY_B).scale(0.42)
                           .next_to(dots[0], LEFT, buff=0.12).set_y(-0.95 - (i - 2) * cell)
                           for i, w in enumerate(WORDS)])
        title = Tex("Attention pattern", color=GREY_B).scale(0.6).next_to(dots, DOWN, buff=0.3)

        self.add(vectors, words, arcs, attn, mlp, blocks, flow, formula, dots, keys, queries, title)
