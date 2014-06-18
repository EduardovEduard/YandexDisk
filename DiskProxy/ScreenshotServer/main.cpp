#include "ScreenshotServer.h"

int main(int argc, char* argv[])
{
	ScreenshotServer server(23456);
	server.accept();
	return 0;
}

