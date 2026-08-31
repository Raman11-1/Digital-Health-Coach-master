# utils/logger.py

import logging
import sys

# Create a custom logger
logger = logging.getLogger("fitness_coach")
logger.setLevel(logging.DEBUG)

# Create handlers
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.DEBUG)

# Create formatters and add to handlers
formatter = logging.Formatter(
    "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
)
console_handler.setFormatter(formatter)

# Add handlers to the logger
logger.addHandler(console_handler)

# Example usage throughout the codebase:
# from utils.logger import logger
# logger.info("This is an info message")
