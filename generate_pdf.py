import subprocess
import os
import re

# 1. Convert markdown to HTML using pandoc with --mathjax
cmd_pandoc = [
    "/opt/homebrew/bin/pandoc",
    "PROJECT_REPORT.md",
    "-f", "markdown",
    "-t", "html5",
    "--mathjax",
]
html_body = subprocess.check_output(cmd_pandoc, text=True)

# 2. Fix mermaid blocks: <pre class="mermaid"><code>...</code></pre> -> <div class="mermaid">...</div>
def unescape_mermaid(match):
    code = match.group(1)
    code = code.replace('&quot;', '"').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    return f'<div class="mermaid">\n{code}\n</div>'

html_body = re.sub(r'<pre class="mermaid"><code>(.*?)</code></pre>', unescape_mermaid, html_body, flags=re.DOTALL)

# 3. Create full academic HTML template
full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>NFA to DFA Conversion Simulator - Technical Project Report</title>
<script>
window.MathJax = {{
  tex: {{
    inlineMath: [['\\\\(', '\\\\)'], ['$', '$']],
    displayMath: [['\\\\[', '\\\\]'], ['$$', '$$']]
  }},
  svg: {{
    fontCache: 'global'
  }}
}};
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.4.0/dist/mermaid.min.js"></script>
<style>
@page {{
    size: A4;
    margin: 16mm 14mm;
    @top-right {{
        content: "NFA to DFA Conversion Simulator";
        font-size: 8pt;
        color: #64748b;
    }}
    @bottom-center {{
        content: counter(page);
        font-size: 9pt;
        color: #475569;
    }}
}}

body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 9.5pt;
    line-height: 1.5;
    color: #1e293b;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
}}

/* Typography */
h1 {{
    font-size: 18pt;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 2.5px solid #2563eb;
    padding-bottom: 6px;
    margin-top: 0;
    margin-bottom: 12px;
}}

h2 {{
    font-size: 13pt;
    font-weight: 700;
    color: #1e3a8a;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 4px;
    margin-top: 20px;
    margin-bottom: 10px;
    page-break-after: avoid;
}}

h3 {{
    font-size: 10.5pt;
    font-weight: 600;
    color: #0f172a;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
}}

p {{
    margin-top: 0;
    margin-bottom: 8px;
    text-align: justify;
}}

ul, ol {{
    margin-top: 0;
    margin-bottom: 8px;
    padding-left: 20px;
}}

li {{
    margin-bottom: 3px;
}}

/* Code Blocks */
pre {{
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 10px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 8pt;
    line-height: 1.4;
    overflow-x: auto;
    page-break-inside: avoid;
    margin-bottom: 10px;
}}

code {{
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 8.5pt;
    background-color: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    color: #0f172a;
}}

pre code {{
    background: transparent;
    padding: 0;
}}

/* Tables */
table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    margin-bottom: 12px;
    font-size: 8.5pt;
    page-break-inside: avoid;
}}

th {{
    background-color: #1e3a8a;
    color: #ffffff;
    font-weight: 600;
    text-align: left;
    padding: 6px 8px;
    border: 1px solid #1e3a8a;
}}

td {{
    padding: 5px 7px;
    border: 1px solid #cbd5e1;
    vertical-align: middle;
}}

tr:nth-child(even) {{
    background-color: #f8fafc;
}}

/* Mermaid container */
.mermaid {{
    display: flex;
    justify-content: center;
    margin: 12px 0;
    page-break-inside: avoid;
}}

.mermaid svg {{
    max-width: 95%;
    height: auto;
}}

hr {{
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 16px 0;
}}

strong {{
    font-weight: 600;
    color: #0f172a;
}}
</style>
</head>
<body>
{html_body}

<script>
mermaid.initialize({{
    startOnLoad: true,
    theme: 'neutral',
    flowchart: {{
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
    }}
}});
</script>
</body>
</html>
"""

with open("report_styled.html", "w") as f:
    f.write(full_html)

print("Generated MathJax report_styled.html")
