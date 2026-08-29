def calculate_openai_cost(
    model: str,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
    cached_tokens: int = 0,
    image_input_tokens: int = 0,
    image_output_tokens: int = 0,
) -> float:

    PRICING = {
        "gpt-4o-mini": {
            "input": 0.150,
            "cached_input": 0.075,
            "output": 0.600,
        },

        "gpt-image-2": {
            "text_input": 5.00,
            "cached_input": 1.25,
            "image_input": 8.00,
            "image_output": 30.00,
        },
    }

    if model not in PRICING:
        raise ValueError(f"Desteklenmeyen model: {model}")

    rates = PRICING[model]
    total_cost = 0.0

    if model == "gpt-4o-mini":
        standard_input_tokens = max(
            0,
            prompt_tokens - cached_tokens
        )
        total_cost += (
            standard_input_tokens / 1_000_000
        ) * rates["input"]
        total_cost += (
            cached_tokens / 1_000_000
        ) * rates["cached_input"]
        total_cost += (
            completion_tokens / 1_000_000
        ) * rates["output"]

    elif model == "gpt-image-2":
        total_cost += (
            prompt_tokens / 1_000_000
        ) * rates["text_input"]
        total_cost += (
            cached_tokens / 1_000_000
        ) * rates["cached_input"]
        total_cost += (
            image_input_tokens / 1_000_000
        ) * rates["image_input"]
        total_cost += (
            image_output_tokens / 1_000_000
        ) * rates["image_output"]

    return round(total_cost, 8)