#pragma once

#include <WinSock2.h>
#include <WS2tcpip.h>

#include <string>
#include <stdexcept>
#include <vector>

class ScreenshotClient
{
public:
	ScreenshotClient(const std::string& ip, short port);
	
	void connect();
	void send(int);

private:
	const std::string& address_;
	const short port_;
	SOCKET socket_;
};

class InitException : public std::runtime_error
{
public:
	InitException(const std::string& what) : std::runtime_error(what) {}
};

class SendException : public std::runtime_error
{
public:
	SendException(const std::string& what) : std::runtime_error(what) {}
};
