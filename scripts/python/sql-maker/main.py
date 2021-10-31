if __name__ == "__main__":
    command_file = open('command.sql','r')
    print('[')
    for line in command_file:
        line = line.rstrip()
        print(f"'{line}',")
    print(']')