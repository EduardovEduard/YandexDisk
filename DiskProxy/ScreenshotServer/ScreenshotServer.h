#pragma once

#include <string>
#include <stdexcept>
#include <fstream>
#include <vector>

#include <WinSock2.h>
#include <WS2tcpip.h>

class ScreenshotServer
{
public:
	ScreenshotServer(short port);
	void accept();

private:
	SOCKET listen();
	void process(SOCKET socket);
	void log(const std::string& msg);

	short port_;
	std::ofstream log_;
	std::vector<std::string> actions_;
};

class InitException : public std::runtime_error
{
public:
	InitException(const std::string& what) : std::runtime_error(what) {}
};

class AcceptException : public std::runtime_error
{
public:
	AcceptException(const std::string& what) : std::runtime_error(what) {}
};