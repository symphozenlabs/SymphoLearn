"""Render the SymphoLearn 'Welcome to the Course' lesson video with ffmpeg."""
# Needs ffmpeg plus playfair.ttf and inter.ttf (Google Fonts, OFL) in the working directory.
import subprocess

W, H, DUR = 1280, 720, 46
INK, PAPER, GREEN, MUTED, BORDER = "0x171916", "0xfcfcfa", "0x5a8a45", "0x90948c", "0xe5e7e2"
FADE = 0.7


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace(":", "\\:").replace("'", "’").replace(",", "\\,").replace("%", "\\%")


def alpha(a, b):
    return (f"if(lt(t,{a}),0,if(lt(t,{a + FADE}),(t-{a})/{FADE},"
            f"if(lt(t,{b - FADE}),1,if(lt(t,{b}),({b}-t)/{FADE},0))))")


def rise(a, base, dist=18):
    # ease-out slide up: base + dist*(1-p)^3
    return f"{base}+{dist}*pow(1-min(1\\,max(0\\,(t-{a})/1.1))\\,3)"


filters = []


def text(s, a, b, x, y, size, color, font="playfair.ttf"):
    filters.append(
        f"drawtext=fontfile={font}:text='{esc(s)}':fontsize={size}:fontcolor={color}:"
        f"x={x}:y='{rise(a, y)}':alpha='{alpha(a, b)}'"
    )


# Editorial frame: hairline grid + brand dot + running label
filters += [
    f"drawbox=x=96:y=0:w=1:h={H}:color={BORDER}:t=fill",
    f"drawbox=x={W - 96}:y=0:w=1:h={H}:color={BORDER}:t=fill",
    f"drawbox=x=0:y=88:w={W}:h=1:color={BORDER}:t=fill",
    f"drawbox=x=0:y={H - 88}:w={W}:h=1:color={BORDER}:t=fill",
    f"drawbox=x=120:y=40:w=10:h=10:color={GREEN}:t=fill",
    f"drawtext=fontfile=inter.ttf:text='SYMPHOLEARN':fontsize=14:fontcolor={INK}:x=142:y=38",
    f"drawtext=fontfile=inter.ttf:text='LESSON 01 — WELCOME TO THE COURSE':fontsize=13:fontcolor={MUTED}:x=w-tw-120:y=39",
    # lesson progress rule along the bottom hairline
    f"drawtext=fontfile=inter.ttf:text='FULL STACK WEB DEVELOPMENT':fontsize=13:fontcolor={MUTED}:x=120:y={H - 56}",
    f"drawtext=fontfile=inter.ttf:text='%{{eif\\:t/60\\:d\\:2}}\\:%{{eif\\:mod(t\\,60)\\:d\\:2}}':fontsize=13:fontcolor={MUTED}:x=w-tw-120:y={H - 56}",
]

# Scene 1 — welcome
text("01 / 05", 0.4, 8.5, 140, 210, 15, GREEN, "inter.ttf")
text("Welcome to the course.", 0.6, 8.5, 136, 260, 84, INK)
text("A journey from your first tag to a deployed application.", 1.4, 8.5, 142, 400, 26, MUTED, "inter.ttf")

# Scene 2 — the course & instructor
text("02 / 05", 9.0, 17.5, 140, 210, 15, GREEN, "inter.ttf")
text("Full Stack", 9.2, 17.5, 136, 250, 96, INK)
text("Web Development", 9.6, 17.5, 380, 360, 96, INK)
text("with Alex Morgan  ·  12 lessons  ·  12h 30m", 10.4, 17.5, 384, 500, 24, MUTED, "inter.ttf")

# Scene 3 — what you'll build
text("03 / 05", 18.0, 28.5, 140, 170, 15, GREEN, "inter.ttf")
text("What you will build.", 18.2, 28.5, 136, 205, 60, INK)
items = ["01   Semantic, accessible HTML", "02   Responsive layouts with modern CSS",
         "03   Interactive JavaScript & the DOM", "04   A deployed full-stack application"]
for i, it in enumerate(items):
    a = 19.2 + i * 0.6
    text(it, a, 28.5, 560, 330 + i * 56, 28, INK, "inter.ttf")
    filters.append(f"drawbox=x=560:y={372 + i * 56}:w=560:h=1:color={BORDER}:t=fill:enable='between(t,{a},28.5)'")

# Scene 4 — method
text("04 / 05", 29.0, 38.5, 140, 210, 15, GREEN, "inter.ttf")
text("Watch.", 29.2, 38.5, 136, 260, 88, INK)
text("Build.", 30.0, 38.5, 456, 260, 88, INK)
text("Reflect.", 30.8, 38.5, 756, 260, 88, GREEN)
text("Every lesson ends with something you made yourself.", 31.8, 38.5, 142, 410, 26, MUTED, "inter.ttf")

# Scene 5 — begin
text("05 / 05", 39.0, DUR, 140, 210, 15, GREEN, "inter.ttf")
text("Let’s begin.", 39.2, DUR + 1, 136, 260, 110, INK)
text("Next — How the Web Works", 40.4, DUR + 1, 142, 420, 26, MUTED, "inter.ttf")

vf = ",".join(filters)
fc = (f"[0:v]{vf}[bg];color=c={GREEN}:s={W}x3:r=30:d={DUR}[bar];"
      f"[bg][bar]overlay=x='-w+{W}*t/{DUR}':y={H - 89}:shortest=1[v]")
with open("fc.txt", "w", encoding="utf-8") as f:
    f.write(fc)

# Soft ambient chord (A2, E3, C#4) with slow tremolo, faded in and out
af = (f"aevalsrc='0.05*sin(2*PI*110*t)*(0.8+0.2*sin(2*PI*0.2*t))"
      f"+0.035*sin(2*PI*164.81*t)*(0.8+0.2*sin(2*PI*0.13*t))"
      f"+0.025*sin(2*PI*277.18*t)*(0.7+0.3*sin(2*PI*0.09*t))':s=44100:d={DUR},"
      f"afade=t=in:d=3,afade=t=out:st={DUR - 4}:d=4")

cmd = [
    "ffmpeg", "-y",
    "-f", "lavfi", "-i", f"color=c={PAPER}:s={W}x{H}:r=30:d={DUR}",
    "-f", "lavfi", "-i", af,
    "-/filter_complex", "fc.txt", "-map", "[v]", "-map", "1:a",
    "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p", "-tune", "animation",
    "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", "-shortest",
    "welcome.mp4",
]
subprocess.run(cmd, check=True)
