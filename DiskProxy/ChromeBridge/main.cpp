#include "ScreenshotClient.h"

#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <algorithm>

int translate(const std::vector<char>& message)
{
	std::string msg(message.begin(), message.end());
	
	size_t colon = msg.find_first_of(":");
	size_t quote1 = msg.find_first_of("\"", colon);
	size_t quote2 = msg.find_first_of("\"", quote1);
	std::string number = msg.substr(quote1 + 1, quote2 - quote1 + 1);

	int num = std::stoi(number);
	return num;
}

int main(int argc, char* argv[])
{
	int size = 0;
	std::vector<char> message;

	ScreenshotClient client("127.0.0.1", 23456);
	client.connect();

	std::cin.read(reinterpret_cast<char*>(&size), 4);
	
	std::vector<char> msg(size);
	std::cin.read(&msg[0], size);

	int result = translate(msg);

	client.send(result);

	return 0;
}

