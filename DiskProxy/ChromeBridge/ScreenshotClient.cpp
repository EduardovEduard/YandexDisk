#include "ScreenshotClient.h"

#pragma comment(lib, "Ws2_32.lib")

#include <vector>
#include <string>

ScreenshotClient::ScreenshotClient(const std::string& address, short port) 
	: address_(address), port_(port), socket_(INVALID_SOCKET)
{
}

void ScreenshotClient::connect()
{
	WSADATA wsaData;
	int goodWsaStart = WSAStartup(MAKEWORD(2,2), &wsaData);
	if (goodWsaStart != 0)
	{
		throw InitException("WSAStartup failed: " + std::to_string(goodWsaStart));
	}

	struct addrinfo *result = nullptr, *ptr = nullptr, hints;
	ZeroMemory(&hints, sizeof(hints));

	hints.ai_family = AF_INET;
	hints.ai_socktype = SOCK_STREAM;
	hints.ai_protocol = IPPROTO_TCP;

	int good = getaddrinfo(address_.c_str(), std::to_string(port_).c_str(), &hints, &result);
	if (good != 0)
	{
		WSACleanup();
		throw InitException("Getaddrinfo failed: " + std::to_string(good));
	}

	SOCKET clientSocket = INVALID_SOCKET;
	ptr = result;

	clientSocket = socket(ptr->ai_family, ptr->ai_socktype, ptr->ai_protocol);
	if (clientSocket == INVALID_SOCKET)
	{
		freeaddrinfo(result);
		WSACleanup();
		throw InitException("Could not create socket: " + std::to_string(WSAGetLastError()));
	}

	good = ::connect(clientSocket, ptr->ai_addr, static_cast<int>(ptr->ai_addrlen));

	freeaddrinfo(result);

	if (good == SOCKET_ERROR)
	{
		closesocket(clientSocket);
		clientSocket = INVALID_SOCKET;
		WSACleanup();
		throw InitException("Could not connect to " + address_);
	}

	socket_ = clientSocket;
}

void ScreenshotClient::send(int msg)
{
	if (socket_ == INVALID_SOCKET)
	{
		connect();
	}

	int result = ::send(socket_, reinterpret_cast<char*>(&msg), sizeof(msg), 0);
	if (result == SOCKET_ERROR)
	{
		closesocket(socket_);
		WSACleanup();
		throw SendException("Could not send: " + std::to_string(WSAGetLastError()));
	}

	result = shutdown(socket_, SD_SEND);
	if (result == SOCKET_ERROR)
	{
		closesocket(socket_);
		WSACleanup();
		throw SendException("Shutdown failed!");
	}
}