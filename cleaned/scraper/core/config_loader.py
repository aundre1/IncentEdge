import yaml
from pathlib import Path
import os

class ConfigLoader:
    def __init__(self, config_dir="scraper/configs"):
        self.config_dir = Path(config_dir)

    def load(self, config_name):
        # Try multiple possible config directories
        possible_dirs = [
            Path("scraper/configs"),
            Path("configs"),
            Path(self.config_dir),
            Path(os.path.dirname(__file__)) / ".." / "configs",
            Path(os.getcwd()) / "scraper" / "configs"
        ]
        
        config_path = None
        for config_dir in possible_dirs:
            potential_path = config_dir / f"{config_name}.yaml"
            if potential_path.exists():
                config_path = potential_path
                break
        
        if not config_path:
            # List available files for debugging
            available_files = []
            for config_dir in possible_dirs:
                if config_dir.exists():
                    files = [str(f) for f in config_dir.glob("*.yaml")]
                    available_files.extend(files)
            
            raise FileNotFoundError(f"Configuration file not found: {config_name}. Available files: {available_files}")
        
        with open(config_path, 'r', encoding='utf-8') as file:
            config = yaml.safe_load(file)
        
        return config