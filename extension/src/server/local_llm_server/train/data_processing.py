import os
import xml.etree.ElementTree as ET
from utils import *
import json


if __name__ == "__main__":
    # Parse XOSC Files
    xosc_files = collect_xosc_files(r"D:/Project/llm-ai-copilot/extension/src/server/local_llm_server/dataset/train/raw_data")
    parsed_files = [parse_xosc_file(file) for file in xosc_files]
    
    # parsed_files list contains root element of the tree for each xosc file in the directory

    #Extract Sequences
    all_sequences = []
    for root in parsed_files:
        sequences = extract_sequences(root)
        print("sequences", sequences)
        all_sequences.extend(sequences)
    #print("all sequence", all_sequences)
    """
    # Convert the XML elements to text format suitable for training
    dataset = create_dataset(all_sequences)

     #Save dataset to JSON

    with open(r"D:/Project/llm-ai-copilot/extension/src/server/local_llm_server/dataset/train/xosc/xosc_training_dataset.json", 'w') as f:
        json.dump(dataset, f, indent=4)
    """
