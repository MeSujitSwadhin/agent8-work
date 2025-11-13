import os
import boto3
from boto3.dynamodb.conditions import Key, Attr
from typing import Dict, Any


class DynamoDBClient:
    def __init__(self, dynamodb_table_name):
        self.dynamodb = boto3.resource(
            "dynamodb",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION_NAME"),
        )
        self.table = self.dynamodb.Table(dynamodb_table_name)

    def get_item(self, key: Dict[str, Any]):
        """
        Get an item from the table.
        :param key: A dictionary specifying the key of the item to get.
        :return: The item if found, else None.
        """
        response = self.table.get_item(Key=key)
        return response.get("Item")

    def put_item(self, item: Dict[str, Any]):
        """
        Put an item into the table.
        :param item: The item to put in the table.
        :return: Response from DynamoDB.
        """
        response = self.table.put_item(Item=item)
        return response

    def update_item(
        self,
        key: Dict[str, Any],
        update_expression: str,
        expression_attributes: Dict[str, Any],
    ):
        """
        Update an item in the table.
        :param key: A dictionary specifying the key of the item to update.
        :param update_expression: A string representing the update expression.
        :param expression_attributes: A dictionary of expression attribute values.
        :return: Response from DynamoDB.
        """
        response = self.table.update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attributes,
            ReturnValues="UPDATED_NEW",
        )
        return response

    def update_items(
        self,
        key: Dict[str, Any],
        update_expression: str,
        expression_attribute_names: Dict[str, str],
        expression_attributes: Dict[str, Any],
    ):
        """
        Update an item in the table.
        :param key: A dictionary specifying the key of the item to update.
        :param update_expression: A string representing the update expression.
        :param expression_attribute_names: A dictionary of expression attribute names for reserved keywords.
        :param expression_attributes: A dictionary of expression attribute values.
        :return: Response from DynamoDB.
        """
        response = self.table.update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attributes,
            ReturnValues="UPDATED_NEW",
        )
        return response

    def delete_item(self, key: Dict[str, Any]):
        """
        Delete an item from the table.
        :param key: A dictionary specifying the key of the item to delete.
        :return: Response from DynamoDB.
        """
        response = self.table.delete_item(Key=key)
        return response

    def query_items(
        self,
        key_condition_expression: Any,
        index_name: str = None,
        ScanIndexForward: bool = True,
        Limit: int = None,
        filter_expression: str = None,
    ):
        """
        Query items in the table based on a key condition expression.
        Optionally use a specified Global Secondary Index (GSI).

        Args:
            key_condition_expression (Any): The condition expression to query on.
            index_name (str, optional): Optional name of a Global Secondary Index to query on.
            ScanIndexForward (bool, optional): Specifies the order of the query results. Defaults to True.
            Limit (int, optional): The maximum number of items to evaluate. Defaults to None.

        Returns:
            List[dict]: List of items that match the query condition.
        """
        query_kwargs = {
            "KeyConditionExpression": key_condition_expression,
            "ScanIndexForward": ScanIndexForward,
        }
        if index_name:
            query_kwargs["IndexName"] = index_name
        if Limit is not None:
            query_kwargs["Limit"] = Limit
        if filter_expression:
            query_kwargs["FilterExpression"] = filter_expression
        response = self.table.query(**query_kwargs)
        return response.get("Items")

    def scan_items(self, **scan_kwargs):
        """
        Scan the table and optionally apply filters to the scan with keyword arguments.

        Args:
            **scan_kwargs (dict): Keyword arguments that are passed to the `scan` method of the DynamoDB Table resource.
            This can include filters, projection expressions, etc.

        Returns:
            List[dict]: A list of items that match the scan criteria.
        """
        response = self.table.scan(**scan_kwargs)
        items = response["Items"]

        # Handling pagination if the scanned data exceeds a single response limit
        while "LastEvaluatedKey" in response:
            response = self.table.scan(
                ExclusiveStartKey=response["LastEvaluatedKey"], **scan_kwargs
            )
            items.extend(response["Items"])

        return items

    def get_items_by_attributes(self, attribute_filters: Dict[str, Any]):
        """
        Get items from the table based on specific attributes and their values.
        :param attribute_filters: A dictionary where keys are attribute names and values are attribute values.
        :return: List of items that match the query condition.
        """
        filter_expression_parts = []
        expression_attribute_values = {}
        for attribute_name, attribute_value in attribute_filters.items():
            placeholder_name = f":{attribute_name}"
            filter_expression_parts.append(f"{attribute_name} = {placeholder_name}")
            expression_attribute_values[placeholder_name] = attribute_value

        filter_expression = " AND ".join(filter_expression_parts)

        response = self.table.scan(
            FilterExpression=filter_expression,
            ExpressionAttributeValues=expression_attribute_values,
        )
        items = response["Items"]
        while "LastEvaluatedKey" in response:
            response = self.table.scan(
                FilterExpression=filter_expression,
                ExpressionAttributeValues=expression_attribute_values,
                ExclusiveStartKey=response["LastEvaluatedKey"],
            )
            items.extend(response["Items"])

        return items


# Example usage
if __name__ == "__main__":
    db_client = DynamoDBClient()
    # Example: Fetch an item with a specific key
    item = db_client.get_item({"Id": "user_id_123"})
    print(item)
