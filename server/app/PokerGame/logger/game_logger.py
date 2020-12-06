import datetime
import json
from typing import List

import structlog

log = structlog.get_logger()


class GameLogger:
    def __init__(self):
        self._log: List = []  # list of messages

    def _log_msg(self, message: str, log_fn, to_user: bool, **kwargs):
        """Logs message with structlog based on log_fn. Adds log to list of logs.

        Args:
            message (str): message to log
            log_fn: structlog.(msg|info|warn|error|debug)
            to_user (bool): [description]
        """
        self._log.append(
            {"message": message, "to_user": to_user, "time": datetime.datetime.now()}
        )
        log_fn(message, **kwargs)

    def msg(self, message: str, to_user: bool, **kwargs):
        self._log_msg(message, log.msg, to_user, **kwargs)

    def info(self, message: str, to_user: bool, **kwargs):
        self._log_msg(message, log.info, to_user, **kwargs)

    def warn(self, message: str, to_user: bool, **kwargs):
        self._log_msg(message, log.warn, to_user, **kwargs)

    def error(self, message: str, to_user: bool, **kwargs):
        self._log_msg(message, log.error, to_user, **kwargs)

    def debug(self, message: str, to_user: bool, **kwargs):
        self._log_msg(message, log.debug, to_user, **kwargs)

    def user_logs(self):
        """List of log messages for the front-end to see"""
        return [msg for msg in self._log if msg["to_user"]]