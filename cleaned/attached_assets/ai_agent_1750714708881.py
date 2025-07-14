import openai
import os
import json
import re

#  Set API key from environment or directly
openai.api_key = os.getenv("OPENAI_API_KEY")

class AIAgent:

    def __init__(self):
        pass

    def extract_fields(self, raw_text):
        prompt = f"""
You're an AI assistant that extracts structured information from webpages about funding programs.

Please read the following text and extract these three fields:

1. "funding_amount": What kind of funding is being offered? Include specific dollar amounts (like "$3,200"), percentages (like "30%"), or types (like "grants", "tax credits").
2. "deadline": Mention any date or time period to apply.
3. "eligibility": Who can apply or qualify?

TEXT:
{raw_text[:5000]}

Return ONLY valid JSON in this format:

{{
  "funding_amount": "...",
  "deadline": "...",
  "eligibility": "..."
}}
"""

        try:
            response = openai.ChatCompletion.create(model="gpt-3.5-turbo",
                                                    messages=[{
                                                        "role": "user",
                                                        "content": prompt
                                                    }],
                                                    temperature=0)
            content = response.choices[0].message["content"].strip()
            print(" GPT response:", content)

            result = json.loads(content) if content.startswith("{") else {}

            # Post-cleaning funding_amount for $/%, etc.
            funding = result.get("funding_amount", "N/A")
            matches = re.findall(
                r'(\$\d{1,3}(,\d{3})*(\.\d+)?|\d+%|\d+ percent)', funding,
                re.IGNORECASE)
            if matches:
                funding = matches[0][0]  # Use only the first clean match

            return {
                "funding_amount": funding or "N/A",
                "deadline": result.get("deadline", "N/A"),
                "eligibility": result.get("eligibility", "N/A")
            }

        except Exception as e:
            print(f"⚠️ AI Extraction failed: {e}")
            return {
                "funding_amount": "N/A",
                "deadline": "N/A",
                "eligibility": "N/A"
            }


# from __future__ import annotations

# import json
# import re
# from functools import lru_cache
# from typing import Dict
# from transformers.utils import logging
# logging.set_verbosity_error()

# import torch
# from transformers import (
#     AutoTokenizer,
#     AutoModelForCausalLM,
#     GenerationConfig,
# )

# MODEL_NAME = "deepseek-ai/deepseek-coder-1.3b-instruct"   # 3 GB RAM

# @lru_cache(maxsize=1)
# def _load_model():
#     """Lazy-load tokenizer & model once per process."""
#     tok = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)

#     mdl = AutoModelForCausalLM.from_pretrained(
#         MODEL_NAME,
#         torch_dtype=torch.float32,
#         device_map={"": "cpu"},
#         trust_remote_code=True,
#     )

#     cfg = GenerationConfig.from_pretrained(MODEL_NAME)
#     cfg.pad_token_id = cfg.eos_token_id
#     mdl.generation_config = cfg

#     return tok, mdl

# class AIAgent:
#     """
#     Extracts {funding_amount, deadline, eligibility} from free text
#     using DeepSeek-Coder 1.3B-Instruct (runs locally, no API key).
#     """

#     def __init__(self):
#         self.tokenizer, self.model = _load_model()
#         print("✅ DeepSeek AI loaded (running locally)")

#     def _run(self, prompt: str, max_new_tokens: int = 512) -> str:

#         tokens = self.tokenizer(prompt, return_tensors="pt", padding=True)
#         input_ids      = tokens.input_ids.to(self.model.device)
#         attention_mask = tokens.attention_mask.to(self.model.device)

#         outputs = self.model.generate(
#             input_ids=input_ids,
#             attention_mask=attention_mask,
#             max_new_tokens=max_new_tokens,
#             do_sample=False,
#         )

#         return self.tokenizer.decode(
#             outputs[0][input_ids.shape[-1]:], skip_special_tokens=True
#         ).strip()

#     # API
#     def extract_fields(self, raw_text: str, preview: int = 5_000) -> Dict[str, str]:
#         prompt = (
#     "You are an AI that extracts structured data from funding-related announcements.\n"
#     "Return only a valid JSON object with the following fields:\n"
#     "- funding_amount: The amount of funding available (in dollars or percent).\n"
#     "- deadline: The application deadline (e.g., 'September 30, 2025').\n"
#     "- eligibility: Who is allowed to apply.\n\n"
#     "Example format:\n"
#     '{\n'
#     '  "funding_amount": "$50,000",\n'
#     '  "deadline": "September 30, 2025",\n'
#     '  "eligibility": "Nonprofits and small businesses in California"\n'
#     '}\n\n'
#     f"TEXT:\n{raw_text[:preview]}\n\n"
#     "Now extract and return the JSON:"
# )

#         try:
#             response = self._run(prompt)

#             json_txt = re.search(r"\{.*?\}", response, re.S).group(0)
#             data = json.loads(json_txt)
#         except Exception as err:
#             print("  Extraction failed:", err)
#             data = {}

#         fund_raw = str(data.get("funding_amount", ""))
#         m = re.search(r"(\$\s?\d[\d,]*(?:\.\d+)?(?:\s?(to|-)\s?\$\d[\d,]*)?|\d+\s?%|\d+\s?percent)", fund_raw, re.I)
#         fund_clean = m.group(0) if m else "N/A"

#         return {
#             "funding_amount": fund_clean,
#             "deadline": data.get("deadline", "N/A"),
#             "eligibility": data.get("eligibility", "N/A"),
#         }

# # Optional test run
# if __name__ == "__main__":
#     sample = """
#     The Green Building Grant offers up to $50,000 in matching funds
#     for commercial retrofits achieving at least a 30 percent energy
#     reduction. Applications are due September 30 2025. Eligible
#     applicants: small or medium businesses registered in New York State.
#     """
#     print(AIAgent().extract_fields(sample))
